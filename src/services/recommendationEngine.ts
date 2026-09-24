import { Movie, UserRating, CommunityUser, RecommendationResult, MatchingFactor, NeighborSimilarity, AlgorithmMode } from '../types/movie';
import { MOVIES_DATABASE } from '../data/movies';
import { COMMUNITY_USERS } from '../data/communityUsers';

// Helper to extract all unique feature dimensions for vectorization
const ALL_GENRES_LIST = Array.from(new Set(MOVIES_DATABASE.flatMap(m => m.genres)));
const ALL_DIRECTORS_LIST = Array.from(new Set(MOVIES_DATABASE.map(m => m.director)));
const ALL_KEYWORDS_LIST = Array.from(new Set(MOVIES_DATABASE.flatMap(m => m.keywords)));

/**
 * Builds a normalized feature vector for a movie
 */
export function buildMovieVector(movie: Movie): { [key: string]: number } {
  const vector: { [key: string]: number } = {};

  // 1. Genre features (Weight: 2.5)
  for (const g of movie.genres) {
    vector[`genre:${g}`] = 2.5;
  }

  // 2. Director feature (Weight: 3.0)
  vector[`director:${movie.director}`] = 3.0;

  // 3. Keyword features (Weight: 1.2)
  for (const kw of movie.keywords) {
    vector[`kw:${kw}`] = 1.2;
  }

  return vector;
}

// Precompute all movie vectors for instant calculation
const PRECOMPUTED_MOVIE_VECTORS = new Map<string, { [key: string]: number }>();
for (const movie of MOVIES_DATABASE) {
  PRECOMPUTED_MOVIE_VECTORS.set(movie.id, buildMovieVector(movie));
}

/**
 * Calculates dot product and cosine similarity between two sparse vectors
 */
function cosineSimilarity(
  vecA: { [key: string]: number },
  vecB: { [key: string]: number }
): { similarity: number; sharedComponents: { key: string; score: number }[] } {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  const shared: { key: string; score: number }[] = [];

  for (const key in vecA) {
    normA += vecA[key] * vecA[key];
    if (key in vecB) {
      const prod = vecA[key] * vecB[key];
      dotProduct += prod;
      shared.push({ key, score: prod });
    }
  }

  for (const key in vecB) {
    normB += vecB[key] * vecB[key];
  }

  if (normA === 0 || normB === 0) {
    return { similarity: 0, sharedComponents: [] };
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return {
    similarity: Math.max(0, Math.min(1, similarity)),
    sharedComponents: shared.sort((a, b) => b.score - a.score),
  };
}

/**
 * Calculates Content-Based similarity for all movies based on user's rated movies and genre preferences
 */
export function calculateContentRecommendations(
  userRatings: Record<string, number>,
  genrePreferences: Record<string, number> = {} // 0 to 1 scale
): Map<string, { score: number; factors: MatchingFactor[]; reasons: string[] }> {
  const resultMap = new Map<string, { score: number; factors: MatchingFactor[]; reasons: string[] }>();
  const userProfileVector: { [key: string]: number } = {};

  const ratedMovieIds = Object.keys(userRatings);

  // If user has rated items, construct their taste profile
  if (ratedMovieIds.length > 0) {
    for (const movieId of ratedMovieIds) {
      const rating = userRatings[movieId];
      // Rating weight: 5 -> +1.5, 4 -> +0.75, 3 -> +0.1, 2 -> -0.8, 1 -> -1.5
      const weight = (rating - 3.0) * 0.75;
      const movieVec = PRECOMPUTED_MOVIE_VECTORS.get(movieId);
      if (!movieVec) continue;

      for (const [feat, val] of Object.entries(movieVec)) {
        userProfileVector[feat] = (userProfileVector[feat] || 0) + val * weight;
      }
    }
  }

  // Inject explicit genre preference sliders from the Mood Compass
  for (const [genre, pref] of Object.entries(genrePreferences)) {
    if (pref > 0) {
      userProfileVector[`genre:${genre}`] = (userProfileVector[`genre:${genre}`] || 0) + pref * 4.0;
    }
  }

  // Check if profile is active or empty
  const hasProfileData = Object.keys(userProfileVector).length > 0;

  for (const movie of MOVIES_DATABASE) {
    const movieVec = PRECOMPUTED_MOVIE_VECTORS.get(movie.id)!;

    if (!hasProfileData) {
      // Cold start: rank by high IMDb rating and broad appeal
      const baseline = (movie.rating / 10) * 0.85 + (movie.year > 2015 ? 0.05 : 0);
      resultMap.set(movie.id, {
        score: Math.min(0.96, Math.max(0.65, baseline)),
        factors: [
          { factor: `Critically acclaimed (${movie.rating}/10)`, contribution: 60, type: 'genre' },
          { factor: `${movie.director} cinematic style`, contribution: 40, type: 'director' },
        ],
        reasons: [`Acclaimed ${movie.genres.join('/')} masterpiece with ${movie.rating} IMDb rating`],
      });
      continue;
    }

    const { similarity, sharedComponents } = cosineSimilarity(userProfileVector, movieVec);

    // Compute top factors and human-readable explanation
    const factors: MatchingFactor[] = [];
    const reasons: string[] = [];

    let totalScore = sharedComponents.reduce((sum, c) => sum + c.score, 0);

    for (const comp of sharedComponents.slice(0, 4)) {
      const pct = totalScore > 0 ? Math.round((comp.score / totalScore) * 100) : 25;
      if (comp.key.startsWith('genre:')) {
        const gName = comp.key.replace('genre:', '');
        factors.push({ factor: `${gName} affinity`, contribution: pct, type: 'genre' });
      } else if (comp.key.startsWith('director:')) {
        const dName = comp.key.replace('director:', '');
        factors.push({ factor: `Directed by ${dName}`, contribution: pct, type: 'director' });
        reasons.push(`Matches your appreciation for ${dName}'s directing`);
      } else if (comp.key.startsWith('kw:')) {
        const kwName = comp.key.replace('kw:', '');
        factors.push({ factor: `Theme: "${kwName}"`, contribution: pct, type: 'keyword' });
      }
    }

    // Identify user's highest rated movie that influenced this recommendation
    if (ratedMovieIds.length > 0) {
      const highestRatedId = [...ratedMovieIds].sort((a, b) => userRatings[b] - userRatings[a])[0];
      const highestRatedMovie = MOVIES_DATABASE.find(m => m.id === highestRatedId);
      if (highestRatedMovie && userRatings[highestRatedId] >= 4) {
        // Shared genres?
        const commonGenres = movie.genres.filter(g => highestRatedMovie.genres.includes(g));
        if (commonGenres.length > 0) {
          reasons.unshift(`Because you rated "${highestRatedMovie.title}" ${userRatings[highestRatedId]}★ (${commonGenres.join(', ')})`);
        }
      }
    }

    if (reasons.length === 0 && factors.length > 0) {
      reasons.push(`High affinity for ${factors.map(f => f.factor).slice(0, 2).join(' & ')}`);
    }

    // Scale similarity into a realistic percentage (60% to 99%)
    const scaledScore = Math.min(0.99, Math.max(0.40, similarity * 0.8 + (movie.rating / 10) * 0.2));

    resultMap.set(movie.id, {
      score: scaledScore,
      factors,
      reasons: reasons.slice(0, 2),
    });
  }

  return resultMap;
}

/**
 * Calculates User-Item Collaborative Filtering (Pearson / Cosine correlation between users)
 */
export function calculateCollaborativeRecommendations(
  userRatings: Record<string, number>,
  communityUsers: CommunityUser[] = COMMUNITY_USERS
): Map<string, { score: number; neighbors: NeighborSimilarity[]; reasons: string[] }> {
  const resultMap = new Map<string, { score: number; neighbors: NeighborSimilarity[]; reasons: string[] }>();
  const ratedMovieIds = Object.keys(userRatings);

  // If user hasn't rated anything, calculate community average ratings
  if (ratedMovieIds.length === 0) {
    for (const movie of MOVIES_DATABASE) {
      const allCommunityRatings: number[] = [];
      const neighbors: NeighborSimilarity[] = [];

      for (const peer of communityUsers) {
        if (peer.ratings[movie.id]) {
          allCommunityRatings.push(peer.ratings[movie.id]);
          if (neighbors.length < 3) {
            neighbors.push({
              user: peer,
              similarity: 0.75,
              rating: peer.ratings[movie.id],
            });
          }
        }
      }

      const avg = allCommunityRatings.length > 0
        ? allCommunityRatings.reduce((a, b) => a + b, 0) / allCommunityRatings.length
        : movie.rating / 2;

      resultMap.set(movie.id, {
        score: avg / 5.0,
        neighbors,
        reasons: [`Popular consensus among community cinephiles (${avg.toFixed(1)}/5★ average)`],
      });
    }
    return resultMap;
  }

  // 1. Compute Pearson/Cosine Similarity between current user and every community user
  const userAvgRating =
    ratedMovieIds.reduce((sum, id) => sum + userRatings[id], 0) / ratedMovieIds.length;

  const userSimilarities: { peer: CommunityUser; similarity: number; peerAvgRating: number }[] = [];

  for (const peer of communityUsers) {
    const peerMovieIds = Object.keys(peer.ratings);
    const peerAvgRating =
      peerMovieIds.reduce((sum, id) => sum + peer.ratings[id], 0) / peerMovieIds.length;

    // Find co-rated items
    const coRated = ratedMovieIds.filter(id => id in peer.ratings);

    if (coRated.length === 0) {
      // Prior baseline similarity based on broad overlap
      userSimilarities.push({ peer, similarity: 0.2, peerAvgRating });
      continue;
    }

    let numerator = 0;
    let denomUser = 0;
    let denomPeer = 0;

    for (const id of coRated) {
      const diffUser = userRatings[id] - userAvgRating;
      const diffPeer = peer.ratings[id] - peerAvgRating;

      numerator += diffUser * diffPeer;
      denomUser += diffUser * diffUser;
      denomPeer += diffPeer * diffPeer;
    }

    let sim = 0;
    if (denomUser > 0 && denomPeer > 0) {
      sim = numerator / (Math.sqrt(denomUser) * Math.sqrt(denomPeer));
      // Dampen if only 1 co-rated item
      if (coRated.length === 1) sim *= 0.6;
    } else {
      // If zero variance, check exact match difference
      const avgDiff = coRated.reduce((sum, id) => sum + Math.abs(userRatings[id] - peer.ratings[id]), 0) / coRated.length;
      sim = 1 - avgDiff / 4.0;
    }

    userSimilarities.push({ peer, similarity: Math.max(-1, Math.min(1, sim)), peerAvgRating });
  }

  // 2. Predict rating for each movie using k-Nearest Neighbors
  for (const movie of MOVIES_DATABASE) {
    let weightedSum = 0;
    let simSum = 0;
    const topNeighbors: NeighborSimilarity[] = [];

    // Filter peers who rated this movie
    const peersWhoRated = userSimilarities.filter(item => movie.id in item.peer.ratings);

    // Sort peers by highest similarity
    peersWhoRated.sort((a, b) => b.similarity - a.similarity);

    for (const { peer, similarity, peerAvgRating } of peersWhoRated) {
      const peerRating = peer.ratings[movie.id];
      if (similarity > 0) {
        weightedSum += similarity * (peerRating - peerAvgRating);
        simSum += similarity;

        if (topNeighbors.length < 3) {
          topNeighbors.push({
            user: peer,
            similarity: Math.round(similarity * 100) / 100,
            rating: peerRating,
          });
        }
      }
    }

    let predictedRating: number;
    if (simSum > 0) {
      predictedRating = userAvgRating + weightedSum / simSum;
    } else {
      // Fallback to general peer average
      const ratings = peersWhoRated.map(p => p.peer.ratings[movie.id]);
      predictedRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : movie.rating / 2;
    }

    predictedRating = Math.max(1, Math.min(5, predictedRating));
    const score = predictedRating / 5.0;

    // Reason synthesis
    const reasons: string[] = [];
    if (topNeighbors.length > 0 && topNeighbors[0].similarity > 0.3) {
      const topPeer = topNeighbors[0];
      reasons.push(`${topPeer.user.name} (${Math.round(topPeer.similarity * 100)}% taste match) rated this ${topPeer.rating}★`);
    } else {
      reasons.push(`Consensus favorite among users with compatible watch history`);
    }

    resultMap.set(movie.id, {
      score,
      neighbors: topNeighbors,
      reasons,
    });
  }

  return resultMap;
}

/**
 * Master Recommendation Function: Combines Content-Based and Collaborative Filtering
 */
export function generateRecommendations(
  userRatings: Record<string, number>,
  genrePreferences: Record<string, number>,
  mode: AlgorithmMode = 'hybrid',
  hybridWeight: number = 0.5 // 0 = collaborative only, 1 = content only
): RecommendationResult[] {
  const contentRecs = calculateContentRecommendations(userRatings, genrePreferences);
  const collabRecs = calculateCollaborativeRecommendations(userRatings);

  const results: RecommendationResult[] = [];

  for (const movie of MOVIES_DATABASE) {
    const cData = contentRecs.get(movie.id) || { score: 0.7, factors: [], reasons: [] };
    const cfData = collabRecs.get(movie.id) || { score: 0.7, neighbors: [], reasons: [] };

    let finalScoreFraction: number;

    if (mode === 'content') {
      finalScoreFraction = cData.score;
    } else if (mode === 'collaborative') {
      finalScoreFraction = cfData.score;
    } else {
      // Hybrid blend
      finalScoreFraction = hybridWeight * cData.score + (1 - hybridWeight) * cfData.score;
    }

    // Convert to percentage integer (e.g. 96%)
    const matchScore = Math.round(finalScoreFraction * 100);
    const contentScore = Math.round(cData.score * 100);
    const collaborativeScore = Math.round(cfData.score * 100);

    // Merge human reasons
    const mergedReasons: string[] = [];
    if (mode === 'content' || mode === 'hybrid') {
      if (cData.reasons.length > 0) mergedReasons.push(...cData.reasons);
    }
    if (mode === 'collaborative' || (mode === 'hybrid' && mergedReasons.length < 2)) {
      if (cfData.reasons.length > 0) mergedReasons.push(...cfData.reasons);
    }

    results.push({
      movie,
      matchScore: Math.min(99, Math.max(45, matchScore)),
      contentScore,
      collaborativeScore,
      reasons: Array.from(new Set(mergedReasons)),
      topFactors: cData.factors,
      similarNeighbors: cfData.neighbors,
    });
  }

  // Sort by match score descending
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

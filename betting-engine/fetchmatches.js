import { upcomingmatchesFetch, recentmatchesFetch, livematchesFetch } from './utils/kafka.js/matchfetch.js';
export async function fetchAllMatches(){
    await upcomingmatchesFetch()
    await livematchesFetch()
    await recentmatchesFetch()
}

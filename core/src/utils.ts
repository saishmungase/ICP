import { Redis } from "@upstash/redis";
import { industries, redisToken, redisUrl } from "./libs.js";

export const redisP = new Redis({
  url: redisUrl,
  token: redisToken
})

export const industrySearch = (targetIndustry: string) => {
  let l = 0;
  let r = industries.length - 1;

  while (l <= r) {

    let mid = Math.floor(l + (r - l) / 2); 
    
    let midData = industries[mid];
    if (!midData) return null;
    let currentIndustry = midData.industry;

    if (currentIndustry === targetIndustry) {
      return industries[mid]; 
    }
    
    if (currentIndustry < targetIndustry) {
      l = mid + 1; 
    } else {
      r = mid - 1; 
    }
  }

  return null; 
}
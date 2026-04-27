import { Redis } from "@upstash/redis";
import { redisUrl, redisToken } from "./libs.js";

export default class Cache {
    private redis: Redis;

    constructor() {
        this.redis = new Redis({
            url: redisUrl!,
            token: redisToken!,
        });
    }

    check = async (domain: string) => {
        if (!domain) return null;
        try {
            return await this.redis.get(domain);
        } catch (e) {
            console.error('Cache.check error:', e);
            return null;
        }
    };

    set = async (domain: string, data: any): Promise<boolean> => {
        try {
            console.log("We Cached it bro")
            await this.redis.set(domain, JSON.stringify(data), { ex: 60 * 60 * 24 });
            return true;
        } catch (e) {
            console.error('Cache.set error:', e);
            return false;
        }
    };
}
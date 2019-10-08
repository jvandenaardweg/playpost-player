import { Request } from 'express';

export const getRealUserIpAddress = (req: Request): string => {
  const cloudflareIpAddress = req.headers['cf-connecting-ip'] as string;
  const xForwardedForIpAddress = req.headers['x-forwarded-for'] as string;
  const ipAddressOfUser = cloudflareIpAddress || xForwardedForIpAddress || req.ip;

  return ipAddressOfUser;
}

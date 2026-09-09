import Cryptr from 'cryptr'

export const encryptAES = (strToEncrypt: string) => {
  const secret = process.env.NEXT_PUBLIC_SECRET ?? 'heyhey'
  const cryptr = new Cryptr(secret)

  return cryptr.encrypt(strToEncrypt);
}
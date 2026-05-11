import fs from 'fs'
import sharp from 'sharp'

function gerarSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#0f172a"/>
  <text x="50%" y="54%" font-size="${Math.round(size * 0.55)}" text-anchor="middle" dominant-baseline="middle">🔥</text>
</svg>`
}

fs.writeFileSync('public/icon-192.svg', gerarSVG(192))
fs.writeFileSync('public/icon-512.svg', gerarSVG(512))

await sharp('public/icon-192.svg').resize(192, 192).png().toFile('public/icon-192.png')
console.log('icon-192.png criado!')

await sharp('public/icon-512.svg').resize(512, 512).png().toFile('public/icon-512.png')
console.log('icon-512.png criado!')
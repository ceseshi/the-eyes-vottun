import './style.css'
import typescriptLogo from '/typescript.svg'
import viteLogo from '/vite.svg'
import vottunLogo from '/vottun-white.png'
import axios from 'axios'

// Html Template
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>The Eyes</h1>
    <h2>A collection of unique NFTs on the Mumbai blockchain</h2>
    <h3>Featuring: <a href="https://app.vottun.io/" target="_blank">Vottun Web3 API</a></h3>

    <button id="reload" class="button">Reload</button>
    <div id="loader" class="mt-5">Loading...</div>
    <div id="apierror" class="mt-5" style="display:none">Temporary API error, please try again later.</div>
    <div id="images" class="row mt-5"></div>

    <footer class="mt-5">
      <a href="https://vitejs.dev" target="_blank">
        <img src="${viteLogo}" class="logo" alt="Vite logo" />
      </a>
      <a href="https://www.typescriptlang.org/" target="_blank">
        <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
      </a>
      <a href="https://vottun.com/" target="_blank">
        <img src="${vottunLogo}" class="logo vanilla" alt="Vottun logo" />
      </a>

      <div class="copy">
        &copy; 2024 <a href="https://github.com/ceseshi" target=_"blank">ceseshi</a>
    </footer>
  </div>
`
const imagesContainer = document.querySelector('#images')
const imagesLoader = document.querySelector('#loader')
const apiError = document.querySelector('#apierror')
const btnReload = document.querySelector('#reload')
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS
let itemList:any = []

btnReload?.addEventListener('click', () => {
  if (imagesContainer) {
    itemList = []
    sessionStorage.setItem('itemList', JSON.stringify(itemList))
    imagesContainer.innerHTML = ''
    imagesLoader?.removeAttribute('style')
    apiError?.setAttribute('style', 'display:none')
    loadItem(1)
  }
})

// Retrieve itemList
if (sessionStorage.getItem('itemList')) {
  itemList = JSON.parse(sessionStorage.getItem('itemList') || '[]')
}

if (imagesContainer) {
  if (itemList.length) {
    itemList.forEach((item:any) => {
      generateImage(item.tokenId, item.image)
    })
  }
  else {
  // Load NFTs from id 1
    loadItem(1)
  }
}

// Loads one NFT
function loadItem(tokenId:number) {
  if (tokenId > 20) {
    return
  }

  // Authentication
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+import.meta.env.VITE_VOTTUN_API_KEY,
    'X-application-vkn': import.meta.env.VITE_VOTTUN_APP_VKN
  }

  // NFT params
  const params = [
    ["contractAddress", contractAddress],
    ["network", 80001],
    ["id", tokenId]
  ]

  // Get metadata url
  axios.get('https://api.vottun.tech/erc/v1/erc721/tokenUri?'+(new URLSearchParams(params)), { headers })
  .then(response => {
      // Get image url
      axios.get(response.data.uri)
      .then(res => {
        itemList.push({tokenId: tokenId, image: res.data.image})
        sessionStorage.setItem('itemList', JSON.stringify(itemList))
        generateImage(tokenId, res.data.image)
      })
      .catch((err) => {
        console.log(`Error: ${err}`)
      })

      // Load next NFT with a limit of 4, because of rate limits
      if (tokenId < 4) {
        loadItem(tokenId+1)
      }
  })
  .catch(error => {
    if (error.response.data.message.search("nonexistent token") == -1) {
      imagesLoader?.setAttribute('style', 'display:none')
      apiError?.removeAttribute('style')
    }
  })
}

function generateImage(tokenId:number, imageUrl:string) {
  imagesLoader?.setAttribute('style', 'display:none')

  // Generate image
  const imageDiv = document.createElement('div')
  imageDiv.className= 'col-sm-4 col-md-3 mb-3'

  const link = document.createElement('a')
  link.href = `https://testnets.opensea.io/es/assets/mumbai/${contractAddress}/${tokenId}`
  link.target = '_blank'
  link.title = 'View on OpenSea'

  const image = document.createElement('img')
  image.className= 'w-100 rounded'
  image.src = imageUrl

  link.appendChild(image)
  imageDiv.appendChild(link)
  imagesContainer?.appendChild(imageDiv)
}
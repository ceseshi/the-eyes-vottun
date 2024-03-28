import './style.css'
import typescriptLogo from '/typescript.svg'
import viteLogo from '/vite.svg'
import vottunLogo from '/vottun-white.png'
import axios from 'axios'

// template
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>The Eyes</h1>
    <h2>A collection of unique NFTs on the Mumbai blockchain</h2>
    <h3>Featuring: <a href="https://app.vottun.io/" target="_blank">Vottun Web3 API</a></h3>

    <div id="images" class="row"></div>

    <footer>
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
// Loads one NFT
function loadItem(tokenId:number) {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS

  // authentication
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer '+import.meta.env.VITE_VOTTUN_API_KEY,
    'X-application-vkn': import.meta.env.VITE_VOTTUN_APP_VKN
  }

  // NFT params
  const params = {
    contractAddress: contractAddress,
    network: 80001,
    id: tokenId,
  }

  // get metadata
  axios.post('https://api.vottun.tech/erc/v1/erc721/tokenUri', params, { headers })
  .then(response => {
      // get image
      axios.get(response.data.uri)
      .then(res => {
        // generate image
        const imagesContainer = document.querySelector('#images')

        const imageDiv = document.createElement('div')
        imageDiv.className= 'col-sm-4 col-md-3 mb-3'

        const link = document.createElement('a')
        link.href = `https://testnets.opensea.io/es/assets/mumbai/${contractAddress}/${tokenId}`
        link.target = '_blank'
        link.title = 'View on OpenSea'

        const image = document.createElement('img')
        image.className= 'w-100 rounded'
        image.src = res.data.image

        link.appendChild(image)
        imageDiv.appendChild(link)
        if (imagesContainer) {
          imagesContainer.appendChild(imageDiv)
        }
      })
      .catch((err) => {
        console.log(`Error: ${err}`)
      })

      // load next NFT
      loadItem(tokenId+1)
  })
  .catch(error => {
    //console.log(error.response.data)
    if (error.response.data.message.search("nonexistent token") == -1) {
      alert("Temporary API error, please try again later")
    }
  })
}

// lLoad NFTs from id 1
loadItem(1)
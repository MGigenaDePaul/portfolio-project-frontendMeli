import productsData from '../data/products.json'
import SearchBar from '../components/searchBar/SearchBar'
import freeShipping from '../assets/thumbnails/shipping-back-removed.png'
import './SearchResults.css'
import BreadCrumb from '../components/Breadcrumb'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  normalize,
  isVehicleIntent,
  isVehicleCategory,
  buildSearchText,
  isCameraIntent,
  isSecurityModifier,
  isSecurityCameraProduct,
  extractCarBrand,
  matchesQuery,
  isCameraProduct,
  isClothingIntent,
  isClothingCategory,
  getClothingSubcategory,
  isClothingSubcategory,
  isMeatIntent,
  isMeatCategory,
  getMeatSubcategory,
  isMeatSubcategory,
  isBikeIntent,
  isBikeCategory,
  getBikeSubcategory,
  isBikeSubcategory,
  isPhoneIntent,
  isPhoneProduct,
  extractPhoneBrand,
  parseIphoneQuery,
  matchesIphoneSpecs,
} from '../helpers/helpers.js'

const SearchResults = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const query = searchParams.get('search') || ''
  const q = normalize(query.trim())

  const all = productsData.results

  // 1) Búsqueda general (lo que ya tenías, pero mejor: con buildSearchText)
  const generalMatches = all.filter((p) => {
    if (!q) return true
    return matchesQuery(p, q)
  })

  let filteredProducts = generalMatches

  if (q) {
    // A) INTENCIÓN: VEHÍCULOS (autos por marca)
    if (isVehicleIntent(q)) {
      let vehicleMatches = generalMatches.filter((p) => isVehicleCategory(p))

      // Si hay marca en la query, filtramos dentro de autos
      const brand = extractCarBrand(q)
      if (brand) {
        vehicleMatches = vehicleMatches.filter((p) =>
          buildSearchText(p).includes(brand),
        )
      }

      if (vehicleMatches.length > 0) {
        filteredProducts = vehicleMatches
      }
    }

    // B) INTENCIÓN: CÁMARAS
    if (isCameraIntent(q)) {
      const wantsSecurity = isSecurityModifier(q)

      const onlyCameras = all.filter((p) => isCameraProduct(p))

      // 2) distinguimos si es camara de seguridad o no.
      const cameraMatches = onlyCameras.filter((p) => {
        const isSecurity = isSecurityCameraProduct(p)
        if (!wantsSecurity) return !isSecurity
        return isSecurity
      })

      if (cameraMatches.length > 0) {
        filteredProducts = cameraMatches
      }
    }

    /// C) INTENCIÓN: ROPA (por categoría real + subcategoría si aplica)
    if (isClothingIntent(q)) {
      const subcat = getClothingSubcategory(q) // ej: "pantalones"
      const clothingMatches = all
        .filter((p) => isClothingCategory(p))
        .filter((p) => isClothingSubcategory(p, subcat))

      if (clothingMatches.length > 0) {
        filteredProducts = clothingMatches
      }
    }

    // D) INTENCIÓN: CARNES (por categoría real + subcategoría si aplica)
    if (isMeatIntent(q)) {
      const subcat = getMeatSubcategory(q) // ej: "cordero"
      const meatMatches = all
        .filter((p) => isMeatCategory(p))
        .filter((p) => isMeatSubcategory(p, subcat))

      if (meatMatches.length > 0) {
        filteredProducts = meatMatches
      }
    }

    // E) INTENCIÓN: BICICLETAS (por categoría real)
    if (isBikeIntent(q)) {
      const subcat = getBikeSubcategory(q)

      const bikeMatches = all
        .filter((p) => isBikeCategory(p))
        .filter((p) => isBikeSubcategory(p, subcat))

      if (bikeMatches.length > 0) {
        filteredProducts = bikeMatches
      }
    }

    // F) INTENCIÓN: CELULARES / TECNOLOGÍA (phones)
    if (isPhoneIntent(q)) {
      const brand = extractPhoneBrand(q)

      let phoneMatches = all.filter((p) => isPhoneProduct(p))

      // si el user escribió marca/modelo, filtramos dentro
      if (brand) {
        phoneMatches = phoneMatches.filter((p) =>
          buildSearchText(p).includes(brand),
        )
      }

      if (brand === 'iphone') {
        const specs = parseIphoneQuery(q)
        phoneMatches = phoneMatches.filter((p) => matchesIphoneSpecs(p, specs))
      }

      if (phoneMatches.length > 0) {
        filteredProducts = phoneMatches
      }
    }
  }

  filteredProducts = filteredProducts.slice(0, 4)

  const categories =
    filteredProducts.length > 0
      ? filteredProducts[0]?.category_path_from_root?.map((cat) => cat.name)
      : null

  return (
    <div>
      <SearchBar />
      {categories && <BreadCrumb categories={categories} />}
      {filteredProducts.length === 0 ? (
        <div className="no-results">
          No se encontraron productos relacionados a <b>"{query}"</b>
        </div>
      ) : (
        filteredProducts.map((product) => (
          <div key={product.id} className="containerProducts">
            <button
              onClick={() => navigate(`/items/${product.id}`)}
              className="buttons"
            >
              <img
                className="thumbnail"
                src={product.thumbnail}
                alt="thumbnail"
              />
              <div className="container-price-shipping-title">
                <div className="price-shipping">
                  <p className="price">
                    $ {product.price.toLocaleString('es-AR')}
                  </p>
                  {product.shipping?.free_shipping === true && (
                    <img
                      className="shipping"
                      src={freeShipping}
                      alt="free_shipping"
                    />
                  )}
                </div>
                <p className="title">{product.title}</p>
              </div>
              <p className="state">{product.address?.state_name}</p>
            </button>
          </div>
        ))
      )}
    </div>
  )
}

export default SearchResults

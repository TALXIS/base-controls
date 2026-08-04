import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"
import L from "leaflet"
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
})

interface IOpenMapProps {
    latitude: number
    longitude: number
    zoom?: number
    height?: number
    title?: string
    description?: string
}

const frameStyle: React.CSSProperties = {
    width: "100%",
    height: 240,
    overflow: "hidden",
    border: "1px solid #dbe2ea",
    borderRadius: 8,
}

const tileLayerUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

export const OpenMap = ({
    latitude,
    longitude,
    zoom = 13,
    height = 240,
    title = "Pinned location",
    description,
}: IOpenMapProps) => {
    const position: [number, number] = [latitude, longitude]

    return (
        <div style={{ ...frameStyle, height }}>
            <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                <TileLayer attribution={attribution} url={tileLayerUrl} />
                <Marker position={position}>
                    <Popup>
                        <strong>{title}</strong>
                        {description ? <div>{description}</div> : null}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}

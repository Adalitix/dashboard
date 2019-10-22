"strict mode"

import React, { createRef } from "react"
import L from "leaflet"
import {
    Map as LeafletMap,
    TileLayer,
    Marker,
    WMSTileLayer,
    Circle,
    Popup,
} from "react-leaflet"
import "../stylesheets/Map.css"
import red from "@material-ui/core/colors/red"
import green from "@material-ui/core/colors/green"
import PopupInfo from "./PopupInfo"
import FeaturesInfo from "./FeaturesInfo"
import WMSTimeDimensionLayer from "./WMSTimeDimensionLayer"

const reversed = arr => [...arr].reverse()

const getPeiStyle = (selectedFeatures, hoveredFeature) => feature => {
    const danno = parseFloat(feature.properties["danno_tota"])
    let color
    if (danno < 20) {
        color = green[500]
    } else if (danno < 40) {
        color = red[400]
    } else if (danno < 60) {
        color = red[500]
    } else if (danno < 80) {
        color = red[600]
    } else {
        color = red[700]
    }

    return {
        color,
        // weight: selectedFeatures[0] === feature ? 5 : 1,
        fillOpacity: hoveredFeature === feature ? 1 : 0.4,
    }
}

async function fetchFeatureInfo(e, leafletElement, baseUrl, layerName) {
    let { x, y } = e.containerPoint
    let size = leafletElement._size
    let bounds = leafletElement.getBounds().toBBoxString()

    let url = baseUrl
    url += "SERVICE=WMS"
    url += "&VERSION=1.1.1"
    url += "&REQUEST=GetFeatureInfo"
    url += "&FORMAT=image%2Fpng"
    url += "&TRANSPARENT=true"
    url += "&STYLES"
    url += "&INFO_FORMAT=application%2Fjson"
    url += "&FEATURE_COUNT=5"
    url += "&SRS=EPSG%3A4326"
    url += "&QUERY_LAYERS=" + layerName
    url += "&LAYERS=" + layerName
    url += "&X=" + Math.round(x)
    url += "&Y=" + Math.round(y)
    url += "&WIDTH=" + size.x
    url += "&HEIGHT=" + size.y
    url += "&BBOX=" + bounds

    const data = await fetch(url).then(res => res.json())

    return data
}

class Map extends React.Component {
    state = {
        currentPosition: null,
        hoveredFeature: null,
        selectedFeatures: [],
        selectedLayerName: null,
        watchLocationId: null,
        featureDialogOpen: false,
    }

    mapRef = createRef()

    componentDidMount = () => {
        this.mapRef.current.leafletElement.locate({
            setView: true,
            maxZoom: 18,
        })

        if ("geolocation" in navigator) {
            const setPosition = position => {
                this.setState({
                    currentPosition: {
                        latlng: [
                            position.coords.latitude,
                            position.coords.longitude,
                        ],
                        accuracy: position.coords.accuracy,
                    },
                })
            }
            const clearPosition = e =>
                this.setState({
                    currentPosition: null,
                })

            const watchLocationId = navigator.geolocation.watchPosition(
                setPosition,
                clearPosition,
                {
                    enableHighAccuracy: true,
                }
            )

            this.setState({ watchLocationId })
        }
    }

    componentWillUnmount = () => {
        if (this.state.watchLocationId) {
            navigator.geolocation.clearWatch(this.state.watchLocationId)
        }
    }

    onFeatureMouseOver = featureId =>
        this.setState({
            hoveredFeature: featureId,
        })
    onFeatureMouseOut = featureId =>
        this.setState(({ hoveredFeature }) => ({
            hoveredFeature:
                hoveredFeature === featureId ? null : hoveredFeature,
        }))

    onMapClick = async e => {
        // fetch data from all active WMS layers
        const layersToFetchFrom = this.props.layers.filter(
            ({ visible, layers, type }) => visible && layers !== ""
        )
        let datas = await Promise.all(
            layersToFetchFrom.map(layer =>
                fetchFeatureInfo(
                    e,
                    this.mapRef.current.leafletElement,
                    layer.url,
                    layer.layers
                )
                    .catch(e => {
                        return {
                            features: [],
                            error: e,
                        }
                    })
                    .then(({ features }) =>
                        features.map(feature => ({
                            ...feature,
                            tooltip: layer.tooltip,
                            layerName: layer.name,
                        }))
                    )
            )
        )

        let selectedFeatures = datas.reduce(
            (acc, curr) => [...acc, ...curr],
            []
        )

        this.setState({
            selectedFeatures,
            lat: e.latlng.lat,
            lng: e.latlng.lng,
        })
    }

    onFeatureClick = (feature, { lat, lng }, layerName) => {
        this.setState({
            selectedFeatures: [{ ...feature, layerName }],
            lat,
            lng,
        })
    }

    render() {
        return (
            <div id="body-map" style={this.props.style}>
                <LeafletMap
                    ref={this.mapRef}
                    center={[46, 11]}
                    zoom={10}
                    maxZoom={19} // max zoom for OSM tiles
                    animate={true}
                    attributionControl={true}
                    zoomControl={true}
                    doubleClickZoom={true}
                    scrollWheelZoom={true}
                    dragging={true}
                    easeLinearity={0.35}
                    onClick={this.onMapClick}
                >
                    <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
                        key="tilesAttribution"
                    />
                    {this.state.currentPosition && (
                        <>
                            <Marker
                                position={this.state.currentPosition.latlng}
                                key="currentPositionMarker"
                            />
                            <Circle
                                center={this.state.currentPosition.latlng}
                                radius={this.state.currentPosition.accuracy}
                                weight={1}
                                key="currentPositionAccuracy"
                            />
                        </>
                    )}

                    {reversed(this.props.layers)
                        .filter(({ visible, loading }) => visible && !loading)
                        .map(({ url, layers, name, useTime, wmsPlaying, wmsLoading }, i) =>
                            useTime ? (
                                <WMSTimeDimensionLayer
                                    layers={layers}
                                    url={url}
                                    transparent={true}
                                    format="image/png"
                                    key={name}
                                    zIndex={i + 10}
                                    updateLayer={update => this.props.updateLayer(name, update)}
                                    wmsPlaying={wmsPlaying}
                                    wmsLoading={wmsLoading}
                                />
                            ) : (
                                    <WMSTileLayer
                                        layers={layers}
                                        url={url}
                                        transparent={true}
                                        format="image/png"
                                        key={name}
                                        zIndex={i + 10}
                                    />
                                )
                        )}
                    {this.state.selectedFeatures.length > 0 && (
                        <Popup
                            position={[this.state.lat, this.state.lng]}
                            closeButton={false}
                            closeOnClick={false}
                            className="popup"
                            autoPan={false}
                        >
                            <div
                                onClick={() =>
                                    this.setState({
                                        featureDialogOpen: true,
                                    })
                                }
                                className="popup-content"
                            >
                                <PopupInfo
                                    lat={this.state.lat}
                                    lng={this.state.lng}
                                    features={this.state.selectedFeatures}
                                    layerName={this.state.selectedLayerName}
                                />
                            </div>
                        </Popup>
                    )}
                </LeafletMap>
                <FeaturesInfo
                    features={this.state.selectedFeatures}
                    open={this.state.featureDialogOpen}
                    closeHandler={() => {
                        this.setState({ featureDialogOpen: false })
                    }}
                    layerName={this.state.selectedLayerName}
                />
            </div>
        )
    }
}

export default Map

import React from "react"
import "../stylesheets/App.css"
import Header from "./Header"
import ModelsList from "./ModelsList"
import Map from "./Map"
import Sidebar from "./Sidebar"
import MobileBody from "./MobileBody"
import Hidden from "@material-ui/core/Hidden"
import Drawer from "@material-ui/core/Drawer"
import { createMuiTheme, makeStyles } from "@material-ui/core/styles"
import { ThemeProvider } from "@material-ui/styles"
import { grey, green } from "@material-ui/core/colors"
import arrayMove from "array-move"
require("dotenv").config()

const theme = createMuiTheme({
    palette: {
        primary: { light: grey[300], main: grey[900], dark: grey[700] },
        secondary: { light: green[300], main: green[500], dark: green[700] },
    },
})

function findLayerByName(layers, matchName) {
    const matchingLayers = layers.filter(({ name }) => name === matchName)
    return matchingLayers.length !== 0 ? matchingLayers[0] : null
}
function updateLayerByName(layers, layerName, update) {
    return layers.map(layer =>
        layer.name === layerName
            ? {
                  ...layer,
                  ...update,
              }
            : layer
    )
}

// const BASE_URL = process.env.BASE_URL
const BASE_URL = "http://localhost:28000"

export default class App extends React.Component {
    state = {
        lat: null,
        lng: null,
        feature: null,
        selectedPane: 0,
        layers: [],
        selectedLayerName: null,
        activeView: "map",
    }

    constructor(props) {
        super(props)
        fetch(`${BASE_URL}/apis/layers`)
            .then(res => res.json())
            .then(data =>
                this.setState({
                    layers: data.results.map(layer => ({
                        ...layer,
                        url: BASE_URL + "/geoserver/adalitix/wms?",
                        visible: false,
                        data: null,
                        loading: false,
                        layers: layer.layers || "",
                    })),
                })
            )
    }

    selectPane = value => {
        this.setState({ selectedPane: value })
    }

    toggleLayerVisibility = layerName => {
        this.setState(({ layers }) => ({
            layers: layers.map(layer =>
                layer.name === layerName
                    ? {
                          ...layer,
                          visible: !layer.visible,
                      }
                    : layer
            ),
        }))
    }

    updateLayer = (layerName, layerUpdate) =>
        this.setState(({ layers }) => ({
            layers: layers.map(layer =>
                layer.name === layerName
                    ? {
                          ...layer,
                          ...layerUpdate,
                      }
                    : layer
            ),
        }))

    onLayersSortEnd = ({ oldIndex, newIndex }) => {
        this.setState(({ layers }) => ({
            layers: arrayMove(layers, oldIndex, newIndex),
        }))
    }

    changeActiveView = newActiveView =>
        this.setState({
            activeView: newActiveView,
        })

    render() {
        return (
            <ThemeProvider theme={theme}>
                <div className="App">
                    <Header changeActiveView={this.changeActiveView} />
                    {this.state.activeView === "map" && (
                        <div id="body">
                            {/* Mobile-mode body */}
                            <Hidden mdUp>
                                <MobileBody
                                    layers={this.state.layers}
                                    toggleLayerVisibility={
                                        this.toggleLayerVisibility
                                    }
                                    onLayersSortEnd={this.onLayersSortEnd}
                                    layers={this.state.layers}
                                    selectedPane={this.state.selectedPane}
                                    updateLayer={this.updateLayer}
                                    selectPane={this.selectPane}
                                />
                            </Hidden>
                            {/* PC-mode body */}
                            <Hidden smDown>
                                <Map
                                    style={{
                                        flex: "1 0 66%",
                                    }}
                                    layers={this.state.layers}
                                />
                                <Sidebar
                                    layers={this.state.layers}
                                    toggleLayerVisibility={
                                        this.toggleLayerVisibility
                                    }
                                    updateLayer={this.updateLayer}
                                    onLayersSortEnd={this.onLayersSortEnd}
                                    style={{
                                        flex: "1 0 33%",
                                    }}
                                    selectedPane={this.state.selectedPane}
                                    selectPane={this.selectPane}
                                />
                            </Hidden>
                        </div>
                    )}
                    {this.state.activeView === "models" && (
                        <div id="body">
                            <ModelsList />
                        </div>
                    )}
                </div>
            </ThemeProvider>
        )
    }
}

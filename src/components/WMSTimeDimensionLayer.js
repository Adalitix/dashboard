import { WMSTileLayer, withLeaflet, TileLayer } from "react-leaflet"
import React from "react"
import { parseString } from "xml2js"

const PRELOAD_TILES = 10

export default class WMSTimeDimensionLayer extends React.Component {
    state = {
        timestep: 0,
        steps: null,
        show_steps: []
    }
    totalLoaded = PRELOAD_TILES
    playInterval = null

    constructor(props) {
        super(props)

        fetch(
            props.url +
            "service=WMS&version=1.1.0&request=GetCapabilities&layers=" +
            props.layers
        )
            .then(res => res.text())
            .then(text => {
                parseString(text, (err, json) => {
                    const times = json.WMT_MS_Capabilities.Capability[0].Layer[0].Layer.filter(
                        ({ Name }) =>
                            Name.indexOf(
                                props.layers.substring("adalitix:".length)
                            ) !== -1
                    )[0].Extent[0]["_"].split(",")

                    this.setState({ steps: times, show_steps: times.slice(0, PRELOAD_TILES) })
                })
            })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.wmsPlaying && !nextProps.wmsLoading && this.playInterval === null) {
            this.play()
        }
        if ((!nextProps.wmsPlaying || nextProps.wmsLoading) && this.playInterval !== null) {
            this.stop()
        }
    }

    componentWillUnmount() {
        this.stop()
    }

    play = () => {
        this.playInterval = setInterval(
            () => {
                this.setState(({ timestep, steps }) => ({
                    timestep: (timestep + 1) % steps.length,
                    show_steps: steps.slice(timestep, timestep + PRELOAD_TILES)
                }))
            },
            750
        )

        console.log("playing")
    }

    stop = () => {
        clearInterval(this.playInterval)
        this.playInterval = null
        console.log("Stopped")
    }

    onLoad = () => {
        this.totalLoaded += 1

        if (this.totalLoaded === this.state.steps.length || this.totalLoaded >= PRELOAD_TILES) {
            console.log("end loading")

            this.props.updateLayer({ wmsLoading: false })
        }
    }

    onLoading = () => {
        this.totalLoaded -= 1

        if (this.totalLoaded < PRELOAD_TILES / 2 && this.totalLoaded < this.state.steps.length) {
            console.log("loading")
            this.props.updateLayer({ wmsLoading: true })
        }
    }

    render() {
        let { layers, url, name, zIndex } = this.props
        let steps = this.state.show_steps

        if (steps === null) return ""

        return (
            <>
                {steps.map(step => (
                    <WMSTileLayer
                        layers={layers}
                        url={url + "TIME=" + step}
                        transparent={true}
                        format="image/png"
                        key={name + step}
                        zIndex={zIndex}
                        opacity={
                            steps.indexOf(step) === 0
                                ? 1
                                : 0
                        }
                        onLoad={this.onLoad}
                        onLoading={this.onLoading}
                    />
                ))}
            </>
        )
    }
}

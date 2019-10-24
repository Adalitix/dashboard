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

                    this.props.updateLayer({ wmsCurrentTime: times[0], wsmTimeSteps: times })
                    this.setState({ steps: times, show_steps: times.slice(0, PRELOAD_TILES) })
                })
            })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.wmsPlaying && !nextProps.wmsLoading && this.playInterval === null) {
            this.playNextFrame()
        }
        if ((!nextProps.wmsPlaying || nextProps.wmsLoading) && this.playInterval !== null) {
            this.stop()
        }
        if (nextProps.wmsCurrentTime !== this.state.timestep && this.state.steps) {
            let step = this.state.steps.indexOf(nextProps.wmsCurrentTime)
            console.log(nextProps.wmsCurrentTime, step)
            step = step === -1 ? 0 : step

            this.setState({
                timestep: step,
                show_steps: this.state.steps.slice(step, step + PRELOAD_TILES)
            })
        }
    }

    componentWillUnmount() {
        this.stop()
    }

    playNextFrame = () => {
        this.playInterval = setTimeout(
            () => {
                const newStep = (this.state.timestep + 1) % this.state.steps.length
                console.log(newStep)
                this.props.updateLayer({ wmsCurrentTime: this.state.steps[newStep] })

                // not using setInterval so that the playing speed is automatically updated
                if (this.props.wmsPlaying && !this.props.wmsLoading) {
                    this.playNextFrame()
                }
            },
            this.props.wmsPlayingSpeed
        )
    }

    stop = () => {
        clearTimeout(this.playInterval)
        this.playInterval = null
        console.log("Stopped")
    }

    onLoad = () => {
        this.totalLoaded += 1
        console.log(this.totalLoaded)

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
        console.log(this.state)

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

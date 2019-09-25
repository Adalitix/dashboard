import { WMSTileLayer, withLeaflet, TileLayer } from "react-leaflet"
import React from "react"
import { parseString } from "xml2js"

export default class WMSTimeDimensionLayer extends React.Component {
    state = {
        timestep: 0,
        steps: null,
    }
    totalLoaded = 0

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

                    console.log(times)
                    this.setState({ steps: times })
                })
            })
    }

    onLoad = () => {
        this.totalLoaded += 1

        if (this.totalLoaded === this.state.steps.length) {
            setInterval(
                () =>
                    this.setState(({ timestep, steps }) => ({
                        timestep: (timestep + 1) % steps.length,
                    })),
                750
            )
        }
    }

    render() {
        let { layers, url, name, zIndex } = this.props
        let steps = this.state.steps

        if (steps === null) return ""

        return (
            <>
                {steps.map(step => (
                    <WMSTileLayer
                        layers={layers}
                        url={url + "TIME=" + step}
                        transparent={true}
                        format="image/png"
                        key={name}
                        zIndex={zIndex}
                        opacity={
                            this.state.steps.indexOf(step) ===
                            this.state.timestep
                                ? 1
                                : 0
                        }
                        onLoad={this.onLoad}
                    />
                ))}
            </>
        )
    }
}

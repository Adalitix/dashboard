import React from "react"
import "../stylesheets/ModelsList.css"
import ModelCard from "./ModelCard"
import CircularProgress from "@material-ui/core/CircularProgress"

export default class ModelsList extends React.Component {
    state = { applications: null }

    constructor(props) {
        super(props)

        fetch(
            "http://adalitix.westeurope.cloudapp.azure.com:28000/apis/clipper/apps"
        )
            .then(res => res.json())
            .then(applications =>
                this.setState({
                    applications,
                })
            )
    }

    render() {
        return (
            <div id="models-list">
                {this.state.applications ? (
                    this.state.applications.map(app => <ModelCard app={app} />)
                ) : (
                    <CircularProgress id="model-loading-spinner" size={60} />
                )}
            </div>
        )
    }
}

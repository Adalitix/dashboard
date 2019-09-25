import React from "react"
import "../stylesheets/Sidebar.css"
import LayerSelection from "./LayerSelection"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import Icon from "@material-ui/core/Icon"
import LayersIcon from "@material-ui/icons/Layers"
import StorageIcon from "@material-ui/icons/Storage"
import SwipeableViews from "react-swipeable-views"

export default class Sidebar extends React.Component {
    render() {
        return (
            <div id="body-sidebar" style={this.props.style}>
                <div id="sidebar-main">
                    <SwipeableViews
                        index={this.props.selectedPane}
                        onChangeIndex={this.props.selectPane}
                        style={{ height: "100%" }}
                    >
                        <LayerSelection
                            layers={this.props.layers}
                            onToggle={this.props.toggleLayerVisibility}
                            onSortEnd={this.props.onLayersSortEnd}
                            updateLayer={this.props.updateLayer}
                        />
                    </SwipeableViews>
                </div>
            </div>
        )
    }
}

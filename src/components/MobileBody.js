import React from "react"
import "../stylesheets/Sidebar.css"
import LayerSelection from "./LayerSelection"
import Map from "./Map"
import BottomNavigation from "@material-ui/core/BottomNavigation"
import BottomNavigationAction from "@material-ui/core/BottomNavigationAction"
import LayersIcon from "@material-ui/icons/Layers"
import PlaceIcon from "@material-ui/icons/Place"
import "../stylesheets/MobileBody.css"
import SwipeableViews from "react-swipeable-views"

export default class Sidebar extends React.Component {
    render() {
        const selectedPane = this.props.selectedPane

        return (
            <div id="mobile-body">
                <div id="mobile-body-main">
                    <SwipeableViews
                        index={selectedPane}
                        onChangeIndex={this.props.selectPane}
                        style={{ height: "100%" }}
                        disabled={this.props.selectedPane === 0} // disable swiping to change tab when map is selected
                    >
                        <Map
                            layers={this.props.layers}
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                            updateLayer={this.props.updateLayer}
                        />
                        <LayerSelection
                            layers={this.props.layers}
                            onToggle={this.props.toggleLayerVisibility}
                            onSortEnd={this.props.onLayersSortEnd}
                            updateLayer={this.props.updateLayer}
                        />
                    </SwipeableViews>
                </div>
                <BottomNavigation
                    value={selectedPane}
                    onChange={(e, target) => this.props.selectPane(target)}
                    style={{
                        width: "100%",
                    }}
                    id="mobile-body-navigation"
                >
                    <BottomNavigationAction
                        label="Map"
                        value={0}
                        key={0}
                        icon={<PlaceIcon />}
                    />
                    <BottomNavigationAction
                        label="Layers"
                        value={1}
                        key={1}
                        icon={<LayersIcon />}
                    />
                </BottomNavigation>
            </div>
        )
    }
}

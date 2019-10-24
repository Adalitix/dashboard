import React from "react"
import Collapse from "@material-ui/core/Collapse"
import IconButton from "@material-ui/core/IconButton"
import ExpandLess from "@material-ui/icons/ExpandLess"
import ExpandMore from "@material-ui/icons/ExpandMore"
import ButtonBase from "@material-ui/core/ButtonBase"
import Checkbox from "@material-ui/core/Checkbox"
import Typography from "@material-ui/core/Typography"
import MSON from "mson-react/lib/component"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import PauseIcon from "@material-ui/icons/Pause"
import CircularProgress from "@material-ui/core/CircularProgress"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import Slider from "@material-ui/core/Slider"

const BASE_URL = "http://localhost:28000"

class CollapsableContent extends React.Component {
    render() {
        const { fields, model } = this.props

        return (
            <MSON
                definition={{
                    component: "Form",
                    fields: [
                        ...fields,
                        {
                            name: "submit",
                            component: "ButtonField",
                            label: "Compute",
                            type: "submit",
                            icon: "Build",
                        },
                    ],
                }}
                onSubmit={async ({ component }) => {
                    const res = await fetch(
                        `${BASE_URL}/apis/clipper/predict/` + model,
                        {
                            method: "POST",
                            body: JSON.stringify(component.getValues()),
                        }
                    )
                    console.log(res.text())

                    this.props.updateLayer({ layers: res.layers })
                }}
            />
        )
    }
}

export default class LayerSelectionItem extends React.Component {
    state = { open: false }
    render() {
        const {
            visible,
            name,
            onToggle,
            layers,
            updateLayer,
            type,
            fields,
            model,
            wmsLoading,
            wmsPlaying,
            wmsCurrentTime,
            wsmTimeSteps,
            wmsPlayingSpeed,
            useTime,
        } = this.props
        return (
            <ButtonBase className="layer-list-item">
                <div
                    onClick={() => onToggle(name)}
                    className="layer-list-item-main"
                >
                    <Checkbox
                        checked={visible}
                        tabIndex={-1}
                        disableRipple
                        className="layer-list-item-checkbox"
                    />

                    <Typography className="layer-list-item-title">
                        {name}
                    </Typography>
                    {fields !== null && fields !== undefined ? (
                        <IconButton
                            onClick={e => {
                                this.props.onToggleExpand(!this.props.open)
                                e.stopPropagation()
                            }}
                            className="layer-list-item-expand"
                        >
                            {this.props.open ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                    ) : (
                            ""
                        )}
                </div>
                {useTime && visible && (
                    <div className="layer-list-item-timeControls">
                        <span className="layer-list-item-playpause">
                            {!wmsLoading && !wmsPlaying && (
                                <IconButton aria-label="play">
                                    <PlayArrowIcon
                                        onClick={e => {
                                            e.stopPropagation()
                                            updateLayer(name, {
                                                wmsPlaying: true,
                                            })
                                        }}
                                    />
                                </IconButton>
                            )}

                            {!wmsLoading && wmsPlaying && (
                                <IconButton aria-label="pause">
                                    <PauseIcon
                                        onClick={e => {
                                            e.stopPropagation()
                                            updateLayer(name, {
                                                wmsPlaying: false,
                                            })
                                        }}
                                    />
                                </IconButton>
                            )}
                            {wmsLoading && (
                                <CircularProgress
                                    size={26}
                                    style={{ margin: "10px" }}
                                />
                            )}
                        </span>
                        <span className="layer-list-item-time">
                            {wmsCurrentTime}
                        </span>

                        {/* the values are the ms interval between frames */}
                        <Select
                            value={wmsPlayingSpeed}
                            onChange={e =>
                                updateLayer(name, {
                                    wmsPlayingSpeed: e.target.value,
                                })
                            }
                            className="layer-list-item-speed"
                        >
                            <MenuItem value={500}>2x</MenuItem>
                            <MenuItem value={666}>1.5x</MenuItem>
                            <MenuItem value={1000}>1x</MenuItem>
                            <MenuItem value={2000}>0.5x</MenuItem>
                            <MenuItem value={4000}>0.25x</MenuItem>
                        </Select>
                        {wsmTimeSteps && wmsCurrentTime && (
                            <Slider
                                className="layer-list-item-seekbar"
                                value={wsmTimeSteps.indexOf(wmsCurrentTime)}
                                valueLabelDisplay="auto"
                                step={1}
                                min={0}
                                max={wsmTimeSteps.length - 1}
                                onChange={(e, value) =>
                                    updateLayer(name, {
                                        wmsCurrentTime: wsmTimeSteps[value],
                                    })}
                            />
                        )}
                    </div>
                )}

                {fields !== null && fields !== undefined ? (
                    <Collapse in={this.props.open} timeout="auto" unmountOnExit>
                        <CollapsableContent
                            updateLayer={update => updateLayer(name, update)}
                            layers={layers}
                            name={name}
                            fields={fields}
                            model={model}
                        />
                    </Collapse>
                ) : (
                        ""
                    )}
            </ButtonBase>
        )
    }
}

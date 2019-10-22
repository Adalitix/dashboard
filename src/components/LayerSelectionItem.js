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
import CircularProgress from '@material-ui/core/CircularProgress';

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

                    {useTime && visible && !wmsLoading && !wmsPlaying && (
                        <IconButton aria-label="play">
                            <PlayArrowIcon
                                onClick={e => {
                                    e.stopPropagation()
                                    updateLayer(name, { wmsPlaying: true })
                                }}
                            />
                        </IconButton>
                    )}

                    {useTime && visible && !wmsLoading && wmsPlaying && (
                        <IconButton aria-label="pause">
                            <PauseIcon
                                onClick={e => {
                                    e.stopPropagation()
                                    updateLayer(name, { wmsPlaying: false })
                                }}
                            />
                        </IconButton>
                    )}
                    {useTime && visible && wmsLoading && <CircularProgress size={26} style={{ margin: "10px" }} />}

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

import React from "react"
import AppBar from "@material-ui/core/AppBar"
import Toolbar from "@material-ui/core/Toolbar"
import Typography from "@material-ui/core/Typography"
import Button from "@material-ui/core/Button"
import "../stylesheets/Header.css"
import Slider from "@material-ui/lab/Slider"

import mpba_logo from '../images/mpba.png'
import fbk_logo from '../images/fbk.png'

export default function Header({ changeActiveView }) {
    return (
        <div id="header">
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" color="inherit" id="header-title">
                        Adalitix
                    </Typography>
                    <Typography
                        variant="h7"
                        color="inherit"
                        id="header-map"
                        onClick={() => changeActiveView("map")}
                    >
                        Map
                    </Typography>
                    <Typography
                        variant="h7"
                        color="inherit"
                        id="header-models"
                        onClick={() => changeActiveView("models")}
                        style={{ flex: "1", }}
                    >
                        Models
                    </Typography>
                    <div id='mpba_logo'>
                        <img src={mpba_logo} alt="FBK-MPBA" style={{ width: "120px"}}/>
                    </div>
                    <div id='mpba_logo'>
                        <img src={fbk_logo} alt="FBK0LOGO" style={{ width: "50px", marginLeft: "20px"}}/>
                    </div>
                </Toolbar>

            </AppBar>
        </div>
    )
}

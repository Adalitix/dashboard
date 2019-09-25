import React from "react"
import Typography from "@material-ui/core/Typography"
import DialogContent from "@material-ui/core/DialogContent"
import DialogTitle from "@material-ui/core/DialogTitle"
import Dialog from "@material-ui/core/Dialog"
import PopupInfo from "./PopupInfo"

class FeaturesInfo extends React.Component {
    render() {
        return (
            <Dialog
                open={this.props.open}
                onClose={this.props.closeHandler}
                fullWidth="600px"
            >
                <DialogTitle id="feature-dialog-title">
                    <Typography variant="h2">Dati Particella</Typography>
                </DialogTitle>
                <DialogContent style={{ paddingBottom: "16px" }}>
                    {this.props.features.map(feature => (
                        <Typography>
                            <PopupInfo features={[feature]} />
                        </Typography>
                    ))}
                </DialogContent>
            </Dialog>
        )
    }
}

export default FeaturesInfo

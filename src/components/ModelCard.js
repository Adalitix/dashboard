import React from "react"
import Card from "@material-ui/core/Card"
import Button from "@material-ui/core/Button"
import CardActions from "@material-ui/core/CardActions"
import Typography from "@material-ui/core/Typography"
import CardContent from "@material-ui/core/CardContent"

export default function ModelCard({ app }) {
    return (
        <Card className="models-list-tile">
            <CardContent className="models-list-tile-content">
                <Typography gutterBottom variant="h5" component="h2">
                    {app.name}
                </Typography>
                <Typography variant="body1" color="textSecondary" component="p">
                    Model:{" "}
                    {app.linked_models.length > 0
                        ? app.linked_models[0].model_name
                        : "None"}
                </Typography>
                {app.linked_models.length > 0 && (
                    <>
                        {" "}
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            component="p"
                        >
                            Replicas:
                            {app.linked_models[0].replicas}
                        </Typography>
                        <Typography
                            variant="body1"
                            color="textSecondary"
                            component="p"
                        >
                            Version:{app.linked_models[0].model_version}
                        </Typography>
                    </>
                )}
                <Typography variant="body1" color="textSecondary" component="p">
                    Endpoint: /{app.name}
                </Typography>
                <Typography variant="body1" color="textSecondary" component="p">
                    Type: {app.input_type}
                </Typography>
            </CardContent>
            <CardActions style={{ align: "left" }}>
                <Button size="small" color="secondary" disabled={true}>
                    Delete
                </Button>
            </CardActions>
        </Card>
    )
}

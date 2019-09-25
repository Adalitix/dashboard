import React from "react"
import Mustache from "mustache"

const mustacheRender = (tooltip, properties) =>
    Mustache.render(tooltip, {
        ...properties,
        round: x => Math.round(x),
    })
        .split("\n")
        .map((substr, i, arr) => (
            <>
                {substr}
                {i !== arr.lenght - 1 ? <br /> : ""}
            </>
        ))

export default ({ features }) => (
    <>
        {features.map(feature => (
            <p>{mustacheRender(feature.tooltip, feature.properties)}</p>
        ))}
    </>
)

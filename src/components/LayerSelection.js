import React, { Component } from "react"
import { render } from "react-dom"
import {
    sortableContainer,
    sortableElement,
    sortableHandle,
} from "react-sortable-hoc"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemText from "@material-ui/core/ListItemText"
import Checkbox from "@material-ui/core/Checkbox"
import CircularProgress from "@material-ui/core/CircularProgress"
import TextField from "@material-ui/core/TextField"
import SearchIcon from "@material-ui/icons/Search"
import InputAdornment from "@material-ui/core/InputAdornment"
import fuzzy from "fuzzy"
import LayerSelectionItem from "./LayerSelectionItem"

const SortableItem = sortableElement(
    ({
        visible,
        name,
        onToggle,
        onToggleExpand,
        loading,
        open,
        type,
        layers,
        updateLayer,
        fields,
        model,
        wmsLoading,
        wmsPlaying,
        useTime
    }) => (
            <LayerSelectionItem
                visible={visible}
                name={name}
                onToggle={onToggle}
                onToggleExpand={onToggleExpand}
                open={open}
                layers={layers}
                updateLayer={updateLayer}
                type={type}
                fields={fields}
                model={model}
                wmsLoading={wmsLoading}
                useTime={useTime}
                wmsPlaying={wmsPlaying}
            />
        )
)

const SortableContainer = sortableContainer(({ children }) => {
    return <List>{children}</List>
})

export default class LayerSelection extends React.Component {
    state = {
        searchValue: "",
        openItems: [],
    }

    onChangeSearchValue = e =>
        this.setState({
            searchValue: e.target.value,
        })

    render() {
        const { layers, onSortEnd, onToggle, updateLayer } = this.props

        return (
            <>
                <TextField
                    placeholder="Search layers"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    style={{
                        width: "calc(100% - 28px)",
                        margin: "14px 14px 0 14px",
                    }}
                    variant="outlined"
                    value={this.state.searchValue}
                    onChange={this.onChangeSearchValue}
                />
                <SortableContainer
                    onSortEnd={onSortEnd}
                    pressDelay={200}
                    shouldCancelStart={e => {
                        return (
                            e.srcElement.className === "MuiSlider-thumb" ||
                            e.srcElement.tagName === "INPUT"
                        )
                    }}
                    lockAxis="y"
                >
                    {layers
                        .filter(
                            ({ name }) =>
                                !this.state.searchValue ||
                                fuzzy.test(this.state.searchValue, name)
                        )
                        .map(
                            (
                                {
                                    visible,
                                    name,
                                    url,
                                    loading,
                                    type,
                                    layers,
                                    fields,
                                    model,
                                    wmsLoading,
                                    wmsPlaying,
                                    useTime
                                },
                                index
                            ) => (
                                    <SortableItem
                                        key={`item-${index}`}
                                        index={index}
                                        type={type}
                                        visible={visible}
                                        name={name}
                                        url={url}
                                        onToggle={onToggle}
                                        loading={loading}
                                        layers={layers}
                                        updateLayer={updateLayer}
                                        showHandle={!this.state.searchValue}
                                        open={
                                            this.state.openItems.indexOf(name) !==
                                            -1
                                        }
                                        fields={fields}
                                        model={model}
                                        wmsLoading={wmsLoading}
                                        wmsPlaying={wmsPlaying}
                                        useTime={useTime}
                                        onToggleExpand={newOpenState => {
                                            if (newOpenState)
                                                this.setState(({ openItems }) => ({
                                                    openItems: [...openItems, name],
                                                }))
                                            else
                                                this.setState(({ openItems }) => ({
                                                    openItems: openItems.filter(
                                                        item => item !== name
                                                    ),
                                                }))
                                        }}
                                    />
                                )
                        )}
                </SortableContainer>
            </>
        )
    }
}

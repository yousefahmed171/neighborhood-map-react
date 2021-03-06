import React, { Component } from 'react'
import Data from "./Data";
import scriptLoader from 'react-async-script-loader'

class Map extends Component {

    state = {
        map: null,
        bounds: null,
        markers: [],
        google: null
    }

    componentWillReceiveProps({ isScriptLoaded, isScriptLoadSucceed }) {
        if (isScriptLoaded && !this.props.isScriptLoaded) {
            if (isScriptLoadSucceed) {
                var map = new window.google.maps.Map(document.getElementById('map'), {
                    zoom: 11,
                    center: { lat: 30.0444, lng: 31.2357 },
                    styles: Data.mapStyles,
                    disableDefaultUI: true
                });

                var bounds = new window.google.maps.LatLngBounds();

                this.setState({ map: map, bounds: bounds, google: window.google.maps })

            }
            else alert(`Unable to Load Google Maps`)
        }
    }


    updateMarkers = function (shops) {

        this.state.markers.map(marker => marker.setMap(null))
        // eslint-disable-next-line
        this.state.markers = []

        let marker;

        shops.forEach(shop => {
            marker = new this.state.google.Marker({
                position: shop.coor,
                animation: this.state.google.Animation.DROP,
                map: this.state.map,
                fsId: shop.fsId
            })

            marker.addListener('click', () => this.selectShop(shop))

            this.state.bounds.extend(shop.coor)

            this.state.markers.push(marker)
        })

        this.state.map.fitBounds(this.state.bounds)
        this.state.map.setCenter(this.state.bounds.getCenter())

    }

    selectShop(shop) {
        if (shop !== this.props.selected) this.props.selectShop(shop) 
    }

    recenterMap = function (coor) {
        this.state.map.setZoom(15)
        this.state.map.setCenter(coor)
    }

    componentDidUpdate(prevProps, prevState) {

        if (this.state.google !== prevState.google) {
            this.updateMarkers(this.props.filteredShops)
        }

        if (this.state.google !== null && this.props.filteredShops.length !== prevProps.filteredShops.length) {
            this.updateMarkers(this.props.filteredShops)
        }

        this.state.markers.map(marker => marker.setAnimation(null))

        if (this.props.selected !== null && this.state.markers) {

            const activeMarkerIndex = this.state.markers.map(marker => marker.fsId).indexOf(this.props.selected.fsId)
            this.state.markers[activeMarkerIndex].setAnimation(this.state.google.Animation.BOUNCE)

            this.recenterMap(this.props.selected.coor)
        } else if (this.state.google !== null && this.props.selected === null) {

            this.state.map.fitBounds(this.state.bounds)
            this.state.map.setCenter(this.state.bounds.getCenter())
        }

    }

    render() {


        return (
            <div id='map' role="application" aria-roledescription="map for shops list">
                Loading map...
            </div>
        )
    }
}

export default scriptLoader(
    'https://maps.googleapis.com/maps/api/js?key=AIzaSyBnZYx7opXJLtdYvFTOoO3N92ohZfxDXQI'
)(Map)
"use strict";

var React = require("react");
var _ = require("lodash");
var assign   = require('object-assign');

var c3 = require("c3");
var d3 = require("d3");

var isArray = Array.isArray;

var C3Chart = React.createClass({
	displayName: "C3Chart",
	propTypes: {
		type: React.PropTypes.string.isRequired,

		onDataSourceResponse: React.PropTypes.func,
		onDataSourceSuccess: React.PropTypes.func,
		onDataSourceError: React.PropTypes.func,

		options: React.PropTypes.shape({
			padding: React.PropTypes.shape({
				top: React.PropTypes.number,
				bottom: React.PropTypes.number,
				left: React.PropTypes.number,
				right: React.PropTypes.number
			}),
			size: React.PropTypes.shape({
				width: React.PropTypes.number,
				height: React.PropTypes.number
			}),
			labels: React.PropTypes.bool,
			onclick: React.PropTypes.func,
			axisLabel: React.PropTypes.shape({
				x: React.PropTypes.string,
				y: React.PropTypes.string
			}),
			subchart: React.PropTypes.bool,
			zoom: React.PropTypes.bool,
			grid: React.PropTypes.shape({
				x: React.PropTypes.bool,
				y: React.PropTypes.bool
			})
		})
	},

	//color theme
	colors: function colors(count) {
		var colors = [];
		var color = d3.scale.category10();
		for (var i = 0; i < count; i++) {
			colors.push(color(i));
		}
		return colors;
	},

	//apply props.options to graph json
	graphObject: function graphObject() {
		var graphObject = {
			data: {},
			axis: {},
			bindto: "#chartContainer",
			color: {
				pattern: this.colors(20)
			}
		};
		var options = this.props.options;
		if (options.padding) {
			graphObject.padding = {
				top: options.padding.top,
				left: options.padding.left,
				right: options.padding.right,
				bottom: options.padding.bottom
			};
		}
		if (options.size) {
			graphObject.size = {
				width: options.size.width,
				height: options.size.height
			};
		}
		if (options.labels) {
			graphObject.data.labels = options.labels;
		}
		if (options.onClick) {
			graphObject.data.onclick = options.onClick;
		}
		if (options.axisLabel) {
			graphObject.axis.x = { label: options.axisLabel.x };
			graphObject.axis.y = { label: options.axisLabel.y };
		}
		if (options.subchart) {
			graphObject.subchart = { show: options.subchart };
		}
		if (options.zoom) {
			graphObject.zoom = { enabled: options.zoom };
		}
		if (options.grid) {
			graphObject.grid = {
				x: { show: options.grid.x },
				y: { show: options.grid.y }
			};
		}
		return graphObject;
	},

	//c3.js
	drawGraph: function drawGraph() {
		if (!this.data.length) {
			return;
		}

		switch (this.props.type) {
			case "line":
				this.drawGraphLine();
				break;
			case "bar":
				this.drawGraphBar();
				break;
			case "pie":
				this.drawGraphPie();
				break;
			case "multiBar":
				this.drawGraphMultiBar();
				break;
			case "lineBar":
				this.drawGraphlLineBar();
				break;
		}
	},

	drawGraphLine: function drawGraphLine() {
		var graphObject = this.graphObject();
		var graphObjectData = {
			json: this.data[0].values,
			keys: { x: "label", value: ["value"] },
			names: { value: this.data[0].key }
		};
		var graphObjectAxis = {
			x: { type: "category" } // this needed to load string x value
		};

		graphObject.data = _.merge(graphObjectData, graphObject.data);
		graphObject.axis = _.merge(graphObjectAxis, graphObject.axis);

		var chart = c3.generate(graphObject);
		return chart;
	},

	drawGraphBar: function drawGraphBar() {
		var graphObject = this.graphObject();
		var graphObjectData = {
			x: "x",
			json: this.data[0].values,
			keys: { x: "label", value: ["value"] },
			names: { value: this.data[0].key },
			type: "bar",
			labels: true
		};
		var graphObjectAxis = {
			x: { type: "category" } // this needed to load string x value
		};

		graphObject.data = _.merge(graphObjectData, graphObject.data);
		graphObject.axis = _.merge(graphObjectAxis, graphObject.axis);

		var chart = c3.generate(graphObject);
		return chart;
	},

	pieChartDataPreparator: function pieChartDataPreparator(rawData) {
		var data = undefined;
		data = _.map(rawData, function (d) {
			return [d.label, d.value];
		});
		return data;
	},

	drawGraphPie: function drawGraphPie() {
		var graphObject = this.graphObject();
		var graphObjectData = {
			columns: this.pieChartDataPreparator(this.data[0].values),
			type: "pie"
		};

		graphObject.data = _.merge(graphObjectData, graphObject.data);

		var chart = c3.generate(graphObject);
		return chart;
	},

	multiDmsDataPreparator: function multiDmsDataPreparator(rawData) {
		var xLabels = ["x"]; // to make ['x', 'a', 'b', 'c' ...] for labels
		_.map(rawData[0].values, function (d) {
			xLabels.push(d.label);
		});

		var data = undefined;
		data = _.map(rawData, function (datum) {
			var row = [datum.key]; // to make ['key', 30, 200, 100, 400 ...] for each row
			_.map(datum.values, function (d) {
				row.push(d.value);
			});
			return row;
		});
		data.push(xLabels);
		return data;
	},

	drawGraphMultiBar: function drawGraphMultiBar() {
		var graphObject = this.graphObject();
		var graphObjectData = {
			x: "x",
			columns: this.multiDmsDataPreparator(this.data),
			type: "bar",
			labels: true
		};
		var graphObjectAxis = {
			x: { type: "category" } // this needed to load string x value
		};

		graphObject.data = _.merge(graphObjectData, graphObject.data);
		graphObject.axis = _.merge(graphObjectAxis, graphObject.axis);

		var chart = c3.generate(graphObject);
		return chart;
	},

	drawGraphlLineBar: function drawGraphlLineBar() {
		var graphObject = this.graphObject();
		var graphObjectData = {
			x: "x",
			columns: this.multiDmsDataPreparator(this.data),
			types: { dataSource1: "bar" }
		};
		var graphObjectAxis = {
			x: { type: "category" } // this needed to load string x value
		};

		graphObject.data = _.merge(graphObjectData, graphObject.data);
		graphObject.axis = _.merge(graphObjectAxis, graphObject.axis);

		var chart = c3.generate(graphObject);
		return chart;
	},

	/**
	 * Loads remote data
	 *
	 * @param  {String/Function/Promise} [dataSource]
	 * @param  {Object} [props]
	 */
	loadDataSource: function(dataSource, props) {
		props = props || this.props

		if (!arguments.length){
			dataSource = props.dataSource
		}

		if (typeof dataSource == 'function'){
			dataSource = dataSource(props)
		}

		if (typeof dataSource == 'string'){
			var fetch = this.props.fetch || global.fetch

			dataSource = fetch(dataSource)
		}

		if (dataSource && dataSource.then){

			if (props.onDataSourceResponse){
				dataSource.then(props.onDataSourceResponse, props.onDataSourceResponse)
			} else {
				this.setState({
					defaultLoading: true
				})

				var errorFn = function(err){
					if (props.onDataSourceError){
						props.onDataSourceError(err)
					}

					this.setState({
						defaultLoading: false
					})
				}.bind(this)

				var noCatchFn = dataSource['catch']? null: errorFn

				dataSource = dataSource
					.then(function(response){
						return response && typeof response.json == 'function'?
									response.json():
									response
					})
					.then(function(json){

						if (props.onDataSourceSuccess){
							props.onDataSourceSuccess(json)
							this.setState({
								defaultLoading: false
							})
							return
						}

						var info
						if (typeof props.getDataSourceInfo == 'function'){
							info = props.getDataSourceInfo(json)
						}

						var data = info?
							info.data:
							Array.isArray(json)?
								json:
								json.data

						var count = info?
							info.count:
							json.count != null?
								json.count:
								null


						var newState = {
							defaultData: data,
							defaultLoading: false
						}

						if (count != null){
							newState.defaultDataSourceCount = count
						}

						this.setState(newState)
					}.bind(this), noCatchFn)

				if (dataSource['catch']){
					dataSource['catch'](errorFn)
				}
			}

			if (props.onDataSourceLoaded){
				dataSource.then(props.onDataSourceLoaded)
			}
		}

		return dataSource
	},

	prepareProps: function (thisProps, state) {
		var props = assign({}, thisProps)

		props.data = this.prepareData(props)
		props.dataSource = this.prepareDataSource(props)
		props.empty		= !props.data.length

		return props
	},

	/**
	 * Returns true if in the current configuration,
	 * the datagrid should load its data remotely.
	 *
	 * @param  {Object}  [props] Optional. If not given, this.props will be used
	 * @return {Boolean}
	 */
	isRemoteDataSource: function(props) {
		props = props || this.props

		return props.dataSource && !isArray(props.dataSource)
	},

	prepareDataSource: function(props) {
		var dataSource = props.dataSource

		if (isArray(dataSource)){
			dataSource = null
		}

		return dataSource
	},

	prepareData: function(props) {

		var data = null

		if (isArray(props.data)){
			data = props.data
		}

		if (isArray(props.dataSource)){
			data = props.dataSource
		}

		data = data == null? this.state.defaultData: data

		if (!isArray(data)){
			data = []
		}

		return data
	},

	getInitialState: function(){
		return {
		}
	},

	componentWillMount: function () {
		if (this.isRemoteDataSource(this.props)){
			this.loadDataSource(this.props.dataSource, this.props)
		}
	},

	componentDidMount: function () {
		this.drawGraph();
	},

	componentDidUpdate: function () {
		this.drawGraph();
	},

	render: function () {
		var props = this.prepareProps(this.props, this.state)

		this.data = props.data
		this.dataSource = props.dataSource

		return React.createElement(
			"div",
			null,
			React.createElement("div", { id: "chartContainer" })
		);
	}
});

module.exports = C3Chart;

var React = require('react'),
	createClass = require('create-react-class'),
	moment = require('moment')
	;

class DaysView extends React.Component {
	render() {
		const date = this.props.viewDate;
		const locale = date.localeData();

		return (
			<div className="rdtDays">
				<table>
					<thead>
						{ this.renderNavigation( date, locale ) }
						{ this.renderDayHeaders( locale ) }
					</thead>
					<tbody>
						{ this.renderDays( date ) }
					</tbody>
					{ this.renderFooter() }
				</table>
			</div>
		);
	}

	renderNavigation( date, locale ) {
		return (
			<tr>
				<th className="rdtPrev" onClick={ () => this.props.navigate( -1, 'months' ) }>
					<span>‹</span>
				</th>
				<th className="rdtSwitch" onClick={ () => this.props.showView( 'months' ) } colSpan="5" data-value={ this.props.viewDate.month() }>
					{ locale.months( date ) + ' ' + date.year() }
				</th>
				<th className="rdtNext" onClick={ () => this.props.navigate( 1, 'months' ) }>
					<span>›</span>
				</th>
			</tr>
		);
	}

	renderDayHeaders( locale ) {
		let dayItems = this.getDaysOfWeek( locale ).map( (day, index) => (
			<th key={ day + index } className="dow">{ day }</th>
		));

		return (
			<tr>
				{ dayItems }
			</tr>
		);
	}

	renderDays( date ) {

	}

	renderFooter( date ) {

	}
}

var DateTimePickerDays = createClass({
	render: function() {
		var footer = this.renderFooter(),
			date = this.props.viewDate,
			locale = date.localeData(),
			tableChildren
			;

		tableChildren = [
			React.createElement('thead', { key: 'th' }, [
				React.createElement('tr', { key: 'h' }, [
					React.createElement('th', { key: 'p', className: 'rdtPrev', onClick: () => this.props.navigate( -1, 'months' )}, React.createElement('span', {}, '‹' )),
					React.createElement('th', { key: 's', className: 'rdtSwitch', onClick: () => this.props.showView( 'months' ), colSpan: 5, 'data-value': this.props.viewDate.month() }, locale.months( date ) + ' ' + date.year() ),
					React.createElement('th', { key: 'n', className: 'rdtNext', onClick: () => this.props.navigate( 1, 'months' )}, React.createElement('span', {}, '›' ))
				]),
				React.createElement('tr', { key: 'd'}, this.getDaysOfWeek( locale ).map( function( day, index ) { return React.createElement('th', { key: day + index, className: 'dow'}, day ); }) )
			]),
			React.createElement('tbody', { key: 'tb' }, this.renderDays())
		];

		if ( footer )
			tableChildren.push( footer );

		return React.createElement('div', { className: 'rdtDays' },
			React.createElement('table', {}, tableChildren )
		);
	},

	/**
	 * Get a list of the days of the week
	 * depending on the current locale
	 * @return {array} A list with the shortname of the days
	 */
	getDaysOfWeek: function( locale ) {
		var days = locale._weekdaysMin,
			first = locale.firstDayOfWeek(),
			dow = [],
			i = 0
			;

		days.forEach( function( day ) {
			dow[ (7 + ( i++ ) - first) % 7 ] = day;
		});

		return dow;
	},

	renderDays: function() {
		var date = this.props.viewDate,
			selected = this.props.selectedDate && this.props.selectedDate.clone(),
			prevMonth = date.clone().subtract( 1, 'months' ),
			currentYear = date.year(),
			currentMonth = date.month(),
			weeks = [],
			days = [],
			renderer = this.props.renderDay || this.renderDay,
			isValid = this.props.isValidDate || this.alwaysValidDate,
			classes, isDisabled, dayProps, currentDate
			;

		// Go to the last week of the previous month
		prevMonth.date( prevMonth.daysInMonth() ).startOf( 'week' );
		var lastDay = prevMonth.clone().add( 42, 'd' );

		while ( prevMonth.isBefore( lastDay ) ) {
			classes = 'rdtDay';
			currentDate = prevMonth.clone();
			
			dayProps = {
				key: prevMonth.format( 'M_D' ),
				'data-value': prevMonth.date(),
				'data-month': currentMonth,
				'data-year': currentYear
			};

			if ( ( prevMonth.year() === currentYear && prevMonth.month() < currentMonth ) || ( prevMonth.year() < currentYear ) ) {
				classes += ' rdtOld';
				dayProps['data-month'] = prevMonth.month();
				dayProps['data-year'] = prevMonth.year();
			}
			else if ( ( prevMonth.year() === currentYear && prevMonth.month() > currentMonth ) || ( prevMonth.year() > currentYear ) ) {
				classes += ' rdtNew';
				dayProps['data-month'] = prevMonth.month();
				dayProps['data-year'] = prevMonth.year();
			}

			if ( selected && prevMonth.isSame( selected, 'day' ) )
				classes += ' rdtActive';

			if (prevMonth.isSame(moment(), 'day')) {
				classes += ' rdtToday';
			}

			isDisabled = !isValid( currentDate, selected );
			if ( isDisabled )
				classes += ' rdtDisabled';

			dayProps.className = classes;

			if ( !isDisabled )
				dayProps.onClick = this.updateSelectedDate;

			days.push( renderer( dayProps, currentDate, selected ) );

			if ( days.length === 7 ) {
				weeks.push( React.createElement('tr', { key: prevMonth.format( 'M_D' )}, days ) );
				days = [];
			}

			prevMonth.add( 1, 'd' );
		}

		return weeks;
	},

	updateSelectedDate: function( event ) {
		this.props.updateDate( event );
	},

	renderDay: function( props, currentDate ) {
		return React.createElement('td',  props, currentDate.date() );
	},

	renderFooter: function() {
		if ( !this.props.timeFormat )
			return '';

		var date = this.props.selectedDate || this.props.viewDate;

		return React.createElement('tfoot', { key: 'tf'},
			React.createElement('tr', {},
				React.createElement('td', { onClick: () => this.props.showView( 'time' ), colSpan: 7, className: 'rdtTimeToggle' }, date.format( this.props.timeFormat ))
			)
		);
	},

	alwaysValidDate: function() {
		return 1;
	}
});

module.exports = DateTimePickerDays;
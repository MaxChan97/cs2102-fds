var express = require('express');
var router = express.Router();

const { Pool } = require('pg')

const pool = new Pool({
	connectionString: process.env.DATABASE_URL
});

// MWS
var shift1 = [true,true,true,true,false,true,true,true,true,false,false,false];
var shift2 = [false,true,true,true,true,false,true,true,true,true,false,false];
var shift3 = [false,false,true,true,true,true,false,true,true,true,true,false];
var shift4 = [false,false,false,true,true,true,true,false,true,true,true,true];
var nullshift = [false,false,false,false,false,false,false,false,false,false,false,false];

function returnMWSshift(number) {
	if (number == 1) {
		return shift1;
	}
	else if (number == 2) {
		return shift2;
	}
	else if (number == 3) {
		return shift3;
	}
	else if (number == 4) {
		return shift4;
	}
	else {
		return nullshift;
	}
}

/* GET users listing. */
router.get('/', function(req, res, next) {
	var scheduleQuery = "SELECT * FROM Schedules S WHERE S.riderId = " + req.session.riderId + " AND NOW()::timestamp BETWEEN S.startDate AND S.endDate;";
	pool.query(scheduleQuery, (err, scheduleData) => {
		console.log(err);
		console.log(scheduleData.rows);
		if (scheduleData.rows[0].scheduletype == "MONTHLY") {
			mwsQuery = "SELECT * FROM MonthlyWorkSchedules MWS WHERE MWS.scheduleId = " + scheduleData.rows[0].scheduleid + ";";
			pool.query(mwsQuery, (err, mwsData) => {
				var shiftArray = [];
				shiftArray.push(returnMWSshift(mwsData.rows[0].monshift));
				shiftArray.push(returnMWSshift(mwsData.rows[0].tueshift));
				shiftArray.push(returnMWSshift(mwsData.rows[0].wedshift));
				shiftArray.push(returnMWSshift(mwsData.rows[0].thushift));
				shiftArray.push(returnMWSshift(mwsData.rows[0].frishift));
				shiftArray.push(returnMWSshift(mwsData.rows[0].satshift));
				shiftArray.push(returnMWSshift(mwsData.rows[0].sunshift));
				console.log(shiftArray);
				res.render('viewSchedulesPage', {shiftData: shiftArray});
			});
		}
		else if (scheduleData.rows[0].scheduletype == "WEEKLY") {
			wwsQuery = "SELECT * FROM WeeklyWorkSchedules WWS WHERE WWS.scheduleId = " + scheduleData.rows[0].scheduleid + ";";
			pool.query(wwsQuery, (err, wwsData) => {
				res.render('viewSchedulesPage', {shiftData: wwsData.rows[0].hourlyschedule});
			});
		}
	})
});

router.post('/', function(req, res, next) {
	var createSchedule = req.body.create;
	var viewPast = req.body.view;

	console.log(createSchedule, viewPast);
});

module.exports = router;
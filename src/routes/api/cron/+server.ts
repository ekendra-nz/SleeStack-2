import { PRIVATE_SUPABASE_SERVICE_ROLE } from '$env/static/private';
import { PUBLIC_SUPABASE_URL } from '$env/static/public';
import { json } from '@sveltejs/kit';

import { createClient } from '@supabase/supabase-js';

import { add } from 'date-fns';
import { UTCDate } from '@date-fns/utc';
import { toZonedTime } from 'date-fns-tz';

//
export async function POST({ request }) {
	//
	//
	// initiated from https://console.cron-job.org/jobs/5267739/history
	// deets in BitWarden

	// or Raspberry Pi
	// with this cron every 5 minutes
	//
	// */5 * * * * curl -H "Content-Type: application/json" -d '{"code":"specialSecretCode-108@*$&($#&(*))!!!"}' https://sleestack.aroha.space/api/cron

	//
	// ----------------------- override cron permission with this boolean ---------------------
	//
	const permit = true; // turn to false to switch off all cron ops
	const override = false; // turn to true to override the cron permission and allow all ops
	//
	// --------------------------------------------------------------------------------------------

	try {
		const { code } = await request.json();
		if (code == 'specialSecretCode-108@*$&($#&(*))!!!' && permit) {
			//
			let isThisAllowed = false;
			const now = new UTCDate();

			console.log('now: ', now);

			const last_cron_allowed = await logThisCronAttempt(isThisAllowed, now);
			console.log('last_allowed: ', last_cron_allowed);

			if (last_cron_allowed || override) {
				const { sheduleAllow, debugStuff } = checkCronSchedule(now, last_cron_allowed);
				isThisAllowed = sheduleAllow;

				console.log('isThisAllowed: ', isThisAllowed);
				if (isThisAllowed || override) {
					await logThisCronAttempt(isThisAllowed, now);
					//
					// --------------------------------------------------   do cron stuff ----------------------------------------------------
					//

					// delete all user notes from table
					const supabase_private = await createClient(
						PUBLIC_SUPABASE_URL,
						PRIVATE_SUPABASE_SERVICE_ROLE
					);

					await supabase_private.from('notes').delete().neq('id', 0);

					//
					// --------------------------------------------------   end cron stuff ----------------------------------------------------
					//

					return json(
						{
							allowed: isThisAllowed,
							now: now,
							last_cron_attempt: now,
							last_cron_allowed: last_cron_allowed,
							debug: debugStuff
						},
						{ status: 200 }
					);
				}
				return json(
					{
						allowed: isThisAllowed,
						now: now,
						last_cron_attempt: now,
						last_cron_allowed: last_cron_allowed,
						debug: debugStuff
					},
					{ status: 200 }
				);
			} else {
				return json({ message: 'Refresh not allowed!' }, { status: 200 });
			}
		} else {
			return json({ message: 'Not permitted.' }, { status: 200 });
		}
	} catch (error) {
		return json({ message: 'fail! ' + error }, { status: 200 });
	}
}

const logThisCronAttempt = async (allowed: boolean, now: Date) => {
	try {
		let updateData;
		if (allowed) {
			updateData = { last_cron_allowed: now };
		} else {
			updateData = { last_cron_attempt: now };
		}
		const supabase_private = await createClient(PUBLIC_SUPABASE_URL, PRIVATE_SUPABASE_SERVICE_ROLE);

		const { data, error } = await supabase_private
			.from('cron')
			.update(updateData)
			.eq('id', 1)
			.select('last_cron_allowed');

		if (error) {
			console.error('Error updating last_cron_attempt: ', error);
			return false;
		} else {
			// console.log(data);
			return new Date(data[0].last_cron_allowed);
		}
	} catch (error) {
		console.log(error);
		return false;
	}
};

const checkCronSchedule = (now: Date, last_cron_allowed: Date) => {
	//
	let sheduleAllow = false; // assume the cron not allowed
	//
	// ---------------   declare timing schedule -------------------
	const sch = {
		quick_start: 5, // in 24 hour format eg, 05 or 14
		quick_stop: 9,
		quick_interval: 15, // in minutes
		med_start: 8,
		med_stop: 14,
		med_interval: 30,
		regular_start: 14,
		regular_stop: 20,
		regular_interval: 60,
		slow_start: 20,
		slow_stop: 5,
		slow_interval: 120
	};

	const current_NZ_time = toZonedTime(now, 'Pacific/Auckland');
	const kiwi_time = {
		hour: current_NZ_time.getHours(),
		minute: current_NZ_time.getMinutes(),
		seconds: current_NZ_time.getSeconds()
	};
	const last_cron_allowed_NZ_time = toZonedTime(last_cron_allowed, 'Pacific/Auckland');
	const previous_time = {
		hour: last_cron_allowed_NZ_time.getHours(),
		minute: last_cron_allowed_NZ_time.getMinutes(),
		seconds: last_cron_allowed_NZ_time.getSeconds()
	};

	// eslint-disable-next-line prefer-const
	let debugStuff = {
		nz_time: current_NZ_time,
		kiwi_time: kiwi_time,
		last_nz_time: last_cron_allowed_NZ_time,
		previous_time: previous_time,
		window: 'none'
	};

	if (kiwi_time.hour >= sch.quick_start && kiwi_time.hour < sch.quick_stop) {
		//
		// quick period
		debugStuff.window = 'quick';
		console.log(debugStuff.window);

		const compareTime = add(last_cron_allowed_NZ_time, { minutes: sch.quick_interval });
		if (compareTime < current_NZ_time) {
			sheduleAllow = true;
		}
	} else if (kiwi_time.hour >= sch.med_start && kiwi_time.hour < sch.med_stop) {
		//
		// medium period
		debugStuff.window = 'medium';
		console.log(debugStuff.window);

		const compareTime = add(last_cron_allowed_NZ_time, { minutes: sch.med_interval });
		// console.log(compareTime, last_cron_allowed_NZ_time);
		if (compareTime < current_NZ_time) {
			sheduleAllow = true;
		}
	} else if (kiwi_time.hour >= sch.regular_start && kiwi_time.hour < sch.regular_stop) {
		//
		// regular period
		debugStuff.window = 'regular';
		console.log(debugStuff.window);

		const compareTime = add(last_cron_allowed_NZ_time, { minutes: sch.regular_interval });
		console.log('compare: ', compareTime);
		console.log('current_NZ_time: ', current_NZ_time);
		if (compareTime < current_NZ_time) {
			sheduleAllow = true;
		}
	} else if (kiwi_time.hour >= sch.slow_start || kiwi_time.hour < sch.slow_stop) {
		//
		// slow period
		debugStuff.window = 'slow';
		console.log(debugStuff.window);

		const compareTime = add(last_cron_allowed_NZ_time, { minutes: sch.slow_interval });
		if (compareTime < current_NZ_time) {
			sheduleAllow = true;
		}
	} else {
		debugStuff.window = 'failed to find a window';
		console.log(debugStuff.window);
	}

	return { sheduleAllow: sheduleAllow, debugStuff: debugStuff };
};

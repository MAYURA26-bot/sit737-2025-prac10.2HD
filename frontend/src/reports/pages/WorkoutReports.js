import React, { useState, useContext } from 'react';

import DateTimePicker from '../../shared/components/FormElements/DateTimePicker';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
    VALIDATOR_REQUIRE,
} from '../../shared/util/validators';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { useForm } from '../../shared/hooks/form-hook';

import './WorkoutReports.css';

const WorkoutReports = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedWorkoutReport, setWorkoutReport] = useState(null);

    const [formState, inputHandler, setFormData] = useForm(
        {
            from: {
                value: '',
                isValid: false
            },
            to: {
                value: '',
                isValid: false
            },
        },
        false
    );

    const searchSubmitHandler = async event => {
        event.preventDefault();
        setWorkoutReport(null);
        try {
            const from = formState.inputs.from.value;
            const to = formState.inputs.to.value;
            const responseData = await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/reports/user/workout-report?from=${from}&to=${to}`, 'GET', null, {
                Authorization: 'Bearer ' + auth.token
            }
            );
            setWorkoutReport(responseData);
            setFormData(
                {
                    from: {
                        value: from,
                        isValid: true
                    },
                    to: {
                        value: to,
                        isValid: true
                    },
                },
                true
            );
        } catch (err) { }
    }


    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        );
    }

    return <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        {!isLoading && (
            <form className='card-form' onSubmit={searchSubmitHandler}>
                <DateTimePicker
                    id="from"
                    label="From"
                    onInput={inputHandler}
                    mode="date"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please choose a date and time."
                    initialValue={formState.inputs.from.value}
                    initialValid={true}
                />
                <DateTimePicker
                    id="to"
                    label="To"
                    onInput={inputHandler}
                    mode="date"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please choose a date and time."
                    initialValue={formState.inputs.to.value}
                    initialValid={true}
                />
                <Button type="submit" disabled={!formState.isValid}>
                    Search
                </Button>
                {loadedWorkoutReport && (
                    <div className="table-wrapper">
                        <table className="activity-table">
                            <thead>
                                <tr>
                                    <th>Remaining Calories</th>
                                    <th>Calories Burned</th>
                                    <th>Steps</th>
                                    <th>Distance</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr key='1'>
                                    <td>{loadedWorkoutReport.remainingCaloriesToBurn}</td>
                                    <td>{loadedWorkoutReport.totalCaloriesBurned}</td>
                                    <td>{loadedWorkoutReport.totalSteps}</td>
                                    <td>{loadedWorkoutReport.totalDistance}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </form>
        )}
    </React.Fragment>;
}

export default WorkoutReports;
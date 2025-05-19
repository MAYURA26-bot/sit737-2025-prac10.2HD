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

// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip } from 'chart.js';

import './WorkoutReports.css';

// ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip);

import { Line } from 'react-chartjs-2';


const GoalProgressReport = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [chartData, setChartData] = useState(null);

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
        setChartData(null);
        try {
            const from = formState.inputs.from.value;
            const to = formState.inputs.to.value;
            const response = await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/reports/user/goal-progress?from=${from}&to=${to}`, 'GET', null, {
                Authorization: 'Bearer ' + auth.token
            }
            );
            const data = response.data;
            console.log(response);

            const labels = data.map(item => item.date);
            const actualCalories = data.map(item => item.caloriesBurned);
            const goalCalories = data.map(item => item.moveGoal);

            const chartDataset = {
                labels,
                datasets: [
                    {
                        label: 'Calories Burned',
                        data: actualCalories,
                        fill: false,
                        borderColor: 'green',
                        backgroundColor: 'green',
                        lineTension: 0.2
                    },
                    {
                        label: 'Move Goal',
                        data: goalCalories,
                        fill: false,
                        borderColor: 'red',
                        backgroundColor: 'red',
                        borderDash: [5, 5],
                        lineTension: 0.2
                    }
                ]
            };

            setChartData(chartDataset);
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        title: {
            display: true,
            text: 'Daily Goal Progress',
            fontSize: 18
        },
        legend: {
            display: true,
            position: 'top'
        }
    };


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
                {chartData && (
                    <div style={{ height: '400px' }}>
                        {chartData ? (
                            <Line data={chartData} options={chartOptions} />
                        ) : (
                            <p>Loading chart...</p>
                        )}
                    </div>
                )}
            </form>
        )}
    </React.Fragment>;
}

export default GoalProgressReport;
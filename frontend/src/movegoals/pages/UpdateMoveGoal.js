import React, { useState, useContext, useEffect } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
    VALIDATOR_MIN
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';

import './UpdateMoveGoal.css';

const UpdateMoveGoal = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedMoveGoal, setLoadedMoveGoal] = useState();

    const [formState, inputHandler, setFormData] = useForm({
        targetValue: {
            value: 0,
            isValid: false
        }
    },
        false
    )

    useEffect(() => {
        setLoadedMoveGoal(null);
        const fetchMoveGoal = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/moveGoals/user`, 'GET', null, {
                    Authorization: 'Bearer ' + auth.token
                }
                );
                if (responseData.moveGoals && responseData.moveGoals.length > 0) {
                    const moveGoal = responseData.moveGoals[0];
                    setLoadedMoveGoal(moveGoal);
                    setFormData({
                        targetValue: {
                            value: moveGoal.targetValue,
                            isValid: true
                        }
                    }, true);
                } else {
                    const postResponseData = await sendRequest(
                        `${process.env.REACT_APP_BACKEND_URL}/moveGoals`,
                        'POST',
                        JSON.stringify({
                            type: 'calories',
                            targetValue: 1000
                        }),
                        {
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + auth.token
                        }
                    );
                    setLoadedMoveGoal(postResponseData.moveGoal);
                    setFormData({
                        targetValue: {
                            value: postResponseData.moveGoal.targetValue,
                            isValid: true
                        }
                    }, true);
                }

            } catch (err) { }
        }
        fetchMoveGoal();
    }, []);

    const moveGoalUpdateSubmitHandler = async event => {
        event.preventDefault();
        setLoadedMoveGoal(null);
        try {
            const responseData = await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/moveGoals/${loadedMoveGoal.id}`,
                'PATCH',
                JSON.stringify({
                    type: 'calories',
                    targetValue: formState.inputs.targetValue.value
                }),
                {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + auth.token
                }
            );
            setLoadedMoveGoal(responseData.moveGoal);
            setFormData({
                targetValue: {
                    value: responseData.moveGoal.targetValue,
                    isValid: true
                }
            }, true);
        } catch (err) { }
    }

    if (isLoading) {
        return (
            <div className="center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!loadedMoveGoal && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Could not find move goal!</h2>
                </Card>
            </div>
        );
    }

    return <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        {!isLoading && loadedMoveGoal && (
            <form className='card-form' onSubmit={moveGoalUpdateSubmitHandler}>
                <Input
                    element="input"
                    id="targetValue"
                    type="number"
                    label="Target Calories(kJ/Day)"
                    validators={[VALIDATOR_MIN(0)]}
                    errorText="Please enter a valid target value."
                    onInput={inputHandler}
                    initialValue={loadedMoveGoal.targetValue}
                    initialValid={true}
                />
                <Button type="submit" disabled={!formState.isValid}>
                    UPDATE
                </Button>
            </form>
        )}
    </React.Fragment>;
}

export default UpdateMoveGoal;
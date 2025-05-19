import React, { useState, useContext, useEffect } from 'react';

import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Select from '../../shared/components/FormElements/Select';
import DateTimePicker from '../../shared/components/FormElements/DateTimePicker';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
    VALIDATOR_REQUIRE,
    VALIDATOR_MIN
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Profile.css';


const ProfileV = () => {
    const auth = useContext(AuthContext);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const [loadedUser, setLoadedUser] = useState();

    const [formState, inputHandler, setFormData] = useForm(
        {
            name: {
                value: '',
                isValid: false
            },
            gender: {
                value: '',
                isValid: false
            },
            dateOfBirth: {
                value: '',
                isValid: false
            },
            height: {
                value: null,
                isValid: false
            },
            weight: {
                value: null,
                isValid: false
            }
        },
        false
    );

    useEffect(() => {
        setLoadedUser(null);
        const fetchUser = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/users/current`, 'GET', null, {
                    Authorization: 'Bearer ' + auth.token
                }
                );
                setLoadedUser(responseData.user);
                setFormData(
                    {
                        name: {
                            value: responseData.user.name,
                            isValid: true
                        },
                        gender: {
                            value: responseData.user.gender,
                            isValid: true
                        },
                        dateOfBirth: {
                            value: responseData.user.dateOfBirth,
                            isValid: true
                        },
                        height: {
                            value: responseData.user.height,
                            isValid: true
                        },
                        weight: {
                            value: responseData.user.weight,
                            isValid: true
                        }
                    },
                    true
                );
            } catch (err) { }
        };
        fetchUser();
    }, [sendRequest, setFormData]);

    const userUpdateSubmitHandler = async event => {
        event.preventDefault();
        setLoadedUser(null);
        try {
            const formData = new FormData();
            formData.append('name', formState.inputs.name.value);
            formData.append('gender', formState.inputs.gender.value);
            formData.append('dateOfBirth', formState.inputs.dateOfBirth.value);
            formData.append('height', formState.inputs.height.value);
            formData.append('weight', formState.inputs.weight.value);
            const responseData = await sendRequest(`${process.env.REACT_APP_BACKEND_URL}/users`, 'PATCH', formData, {
                Authorization: 'Bearer ' + auth.token
            });
            setLoadedUser(responseData.user);
            setFormData(
                {
                    name: {
                        value: responseData.user.name,
                        isValid: true
                    },
                    gender: {
                        value: responseData.user.gender,
                        isValid: true
                    },
                    dateOfBirth: {
                        value: responseData.user.dateOfBirth,
                        isValid: true
                    },
                    height: {
                        value: responseData.user.height,
                        isValid: true
                    },
                    weight: {
                        value: responseData.user.weight,
                        isValid: true
                    }
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

    if (!loadedUser && !error) {
        return (
            <div className="center">
                <Card>
                    <h2>Could not find user!</h2>
                </Card>
            </div>
        );
    }

    return <React.Fragment>
        <ErrorModal error={error} onClear={clearError} />
        {!isLoading && loadedUser && (
            <form className='card-form' onSubmit={userUpdateSubmitHandler}>
                <Input
                    element="input"
                    id="name"
                    type="text"
                    label="Your Name"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a name."
                    onInput={inputHandler}
                    initialValue={loadedUser.name}
                    initialValid={true}
                />
                <Select
                    id="gender"
                    label="Gender"
                    onInput={inputHandler}
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please select a gender."
                    options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                    ]}
                    initialValue={loadedUser.gender}
                    initialValid={true}
                />
                <DateTimePicker
                    id="dateOfBirth"
                    label="Date Of Birth"
                    onInput={inputHandler}
                    mode="date"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please choose a date and time."
                    initialValue={loadedUser.dateOfBirth}
                    initialValid={true}
                />
                <Input
                    element="input"
                    id="height"
                    type="number"
                    label="Height(cm)"
                    validators={[VALIDATOR_MIN(0)]}
                    errorText="Please enter a valid height."
                    onInput={inputHandler}
                    initialValue={loadedUser.height}
                    initialValid={true}
                />
                <Input
                    element="input"
                    id="weight"
                    type="number"
                    label="Weight(kg)"
                    validators={[VALIDATOR_MIN(0)]}
                    errorText="Please enter a valid weight."
                    onInput={inputHandler}
                    initialValue={loadedUser.weight}
                    initialValid={true}
                />
                <Button type="submit" disabled={!formState.isValid}>
                    UPDATE
                </Button>
            </form>
        )}
    </React.Fragment>;
}

export default ProfileV;
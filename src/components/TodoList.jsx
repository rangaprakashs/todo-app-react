import { useOktaAuth } from "@okta/okta-react";
import React, { useState, useEffect } from "react";
import { List, Input } from "semantic-ui-react";
import "semantic-ui-css/semantic.min.css";
import config from "../okta_config";
import axios from "axios";

const TodoList = ({ userInfo }) => {
	const [todos, setTodos] = useState([]);
	const [input, setInput] = useState("");
	const { authState, oktaAuth } = useOktaAuth();

	const fetchTodos = async () => {
		try {
			if (authState && authState.isAuthenticated) {
				const accessToken = await oktaAuth.getAccessToken();
				const response = await axios.get(config.resourceServer.todosUrl, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
                console.log(response.data, "Fetched!");
				setTodos(response.data);
				console.log(accessToken, userInfo);
			}
		} catch (error) {
			console.error("Failed to fetch todos:", error);
		}
	};
	const addTodo = async () => {
		try {
			if (authState && authState.isAuthenticated) {
				const accessToken = await oktaAuth.getAccessToken();

				const response = await axios.post(
					config.resourceServer.todosUrl,
					{
						todo: input, // Use the input state as the todo item
						email: userInfo.email,
					},
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);
				console.log(response.data); // Assuming the response contains the created todo item
				// Add the created todo item to the todos list
				setTodos((prevTodos) => [...prevTodos, response.data]);
				setInput("");
			}
		} catch (error) {
			console.error("Failed to add a todo:", error);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter") {
			handleAddTodo();
		}
	};

	useEffect(() => {
		const handleKeyPressEvent = (event) => {
			handleKeyPress(event);
		};

		window.addEventListener("keydown", handleKeyPressEvent);
		fetchTodos();

		return () => {
			window.removeEventListener("keydown", handleKeyPressEvent);
		};
	}, [authState]); // Empty array tells React to run the effect once on mount and clean it up on unmount.

	return (
		<div className='App ui container'>
			<Input
				action={{
					color: "blue",
					labelPosition: "right",
					icon: "add",
					content: "Add",
					onClick: addTodo,
				}}
				value={input}
				onChange={(e) => setInput(e.target.value.trim())}
				placeholder='New task...'
			/>
			<List divided relaxed>
				<h1>Your Todo Items</h1>
				{todos.map((todo) => (
					<List.Item key={todo.id}>
						<List.Content>
							<List.Header>{todo.todo}</List.Header>
							<List.Description>{todo.timestamp}</List.Description>
						</List.Content>
					</List.Item>
				))}
			</List>
		</div>
	);
};

export default TodoList;

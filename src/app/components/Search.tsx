"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { BsRobot } from "react-icons/bs";
import { PiSealQuestionThin } from "react-icons/pi";
import { useToast } from "@/components/ui/use-toast";
import { stripIndent, oneLine } from "common-tags";
import OpenAI from "openai";
const showdown = require('showdown');


export default function Search() {
	const router = useRouter();
	const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
	const { toast } = useToast();
	const [questions, setQuestion] = useState<string[]>([]);
	const [answers, setAnswer] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	const supabase = createClientComponentClient();

	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.refresh();
	};

	const toastError = (message = "Something went wrong") => {
		toast({
			title: "Fail to create embedding",
			description: message,
		});
	};

	const converter = new showdown.Converter();

	const handleSearch = async () => {
		setLoading(true);
		const searchText = inputRef.current.value;

		if (searchText && searchText.trim()) {
			setQuestion((currentQuestion) => [...currentQuestion, searchText]);

			const res = await fetch(location.origin + "/embedding", {
				method: "POST",
				body: JSON.stringify({ text: searchText.replace(/\n/g, " ") }),
			});

			if (res.status !== 200) {
				toastError();
			} else {
				const data = await res.json();

				const { data: documents } = await supabase.rpc(
					"match_documents",
					{
						query_embedding: data.embedding,
						match_threshold: 0.8,
						match_count: 10,
					}
				);

				let tokenCount = 0;
				let contextText = "";
				for (let i = 0; i < documents?.length; i++) {
					const document = documents[i];
					const content = document?.content;
					tokenCount += document.token;

					if (tokenCount > 1500) {
						break;
					}
					contextText += `${content.trim()}\n--\n`;
				}

				
				if (documents?.length > 0) {
					
					console.log("from topics :", contextText);
					
					generateAnswer(contextText, searchText);

				} else {
					console.log("no topics available");
				}

				// if (contextText) {
				// 	const prompt = generatePrompt(contextText, searchText);
				// 	await generateAnswer(prompt);
				// } else {
				// 	setAnswer((currentAnswer) => [
				// 		...currentAnswer,
				// 		"Sorry there is no context related to this question. Please ask something about Sokheng",
				// 	]);
				// }
			}
		}
		inputRef.current.value = "";
		setLoading(false);
	};
	const generateAnswer = async (prompt: string, searchText: string) => {
		const topics = generatePrompt(prompt, searchText);
		const res = await fetch(location.origin + "/chat", {
			method: "POST",
			body: JSON.stringify({ topics, searchText }),
		});
		if (res.status !== 200) {
			toastError();
		} else {
			const data = await res.json();

			console.log("from gpt answere: ", data);
			setAnswer((currentAnswer) => [
				...currentAnswer,
				data.choices[0].text,
			]);
		}
	};

	const generatePrompt = (contextText: string, searchText: string) => {
		const prompt = stripIndent`${oneLine`
    Kamu adalah DailyAI yang sangat antusias dan mencintai
    untuk membantu orang! maka dari itu, jawab pertanyaan hanya dengan menggunakan informasi itu,
    dikeluarkan dalam format markdown. Jika Kamu tidak yakin dan jawabannya
    tidak secara eksplisit ditulis dalam dokumentasi, maka katakan
    "Maaf, saya tidak bisa menjawab."`}

    START CONTEXT
    ${contextText}
	END CONTEXT
    QUESTION: ${searchText}
  `;
		return prompt;
	};

	return (
		<>
			<div className="flex-1 h-80vh overflow-y-auto space-y-10">
				<div className="flex items-center justify-between border-b pb-3">
					<div className="flex items-center gap-2">
						<h1>SKRIPSI AI</h1>
					</div>
					<Button onClick={handleLogout}>Signout</Button>
				</div>
				{questions.map((question, index) => {
					const answer = answers[index];

					const isLoading = loading && !answer;

					return (
						<div className="space-y-3" key={index}>
							<div className="flex items-center gap-2 text-indigo-500">
								<PiSealQuestionThin className="w-5 h-5" />
								<h1>{question}</h1>
							</div>
							{isLoading ? <h1>Loading...</h1> : <div dangerouslySetInnerHTML={{ __html: converter.makeHtml(answer) }} />}
						</div>
					);
				})}
			</div>
			<Input
				ref={inputRef}
				placeholder="Tanyakan topik seputar skripsi atma luhur..."
				className="p-5"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleSearch();
					}
				}}
			/>
		</>
	);
}

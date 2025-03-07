"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function AuthComponent() {
	const supabase = createClientComponentClient();

	const handleLoginWithGithub = () => {
		supabase.auth.signInWithOAuth({
			provider: "github",
			options: {
				redirectTo: location.origin + "/auth/callback",
			},
		});
	};

	return (
		<div className=" w-full h-screen flex justify-center items-center">
			<div className="w-96 border shadow-sm p-5 rounded-sm space-y-3">
				<h1 className=" font-bold text-lg">
					{"Welcome to SKRIPSI AI"}
				</h1>
				<p>Ini adalah platform chatbot berbasis RAG (Retrieval-augmented generation)</p>
				<p>dengan memanfaatkan database vector embedding sebagai knowledge base yang akan diolah LLMs (large language models) yaitu chat-gpt-3.50 sebagai natural language (NLP)</p>
				<Button
					className="w-full bg-indigo-500"
					onClick={handleLoginWithGithub}
				>
					Login dengan Github
				</Button>
			</div>
		</div>
	);
}

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(req: Request) {
	// const isAuth = cookies().get("supabase-auth-token");

	// if (!isAuth) {
	// 	return NextResponse.json({ message: "Unathorize" }, { status: 403 });
	// }

	const { topics, searchText } = await req.json();

	const META_PROMPT = `Institut Sains Dan Bisnis (ISB) Atma Luhur berdiri tahun 2020 merupakan pengembangan / rubah bentuk dari Sekolah Tinggi Manajemen Informatikan Dan Komputer (STMIK) Atma Luhur yang berdiri sejak tahun 2009. STMIK Atma Luhur juga merupakan pengembangan / rubah bentuk  dari Akademi Manajemen Informatika dan Komputer (AMIK ) Atma Luhur yang telah berdiri sejak tahun 2001. Sedangkan AMIK Atma Luhur merupakan pengembangan dari Lembaga Kursus Komputer (LPK) Atma Luhur yang sebelumnya bernama LPK Budi Luhur berdiri pada tahun 1991.`;

	const res = await openai.completions.create({
		prompt: topics,
		model: "gpt-3.5-turbo-instruct",
		max_tokens: 512,
		temperature: 0,
	});

	return NextResponse.json({ choices: res.choices });
	// try {
	// 	const res = await openai.completions.create({
	// 		prompt,
	// 		model: "text-davinci-003",
	// 		max_tokens: 512,
	// 		temperature: 0,
	// 	});
	// 	return NextResponse.json({ choices: res.choices });



	// //	console.log(completion.choices[0].message);
	// } catch {
	// 	return NextResponse.json(
	// 		{ message: "Something went wrong!" },
	// 		{ status: 400 }
	// 	);
	// }
}

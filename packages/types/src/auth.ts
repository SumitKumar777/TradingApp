import z from "zod";



export const signUpObject = z.object({
   name: z.string().min(4,{message:"name is too short minimum 4 characters"}).max(30,{message:"name is too big maximum 30 characters"}),
   email: z
      .string()
      .trim()
      .toLowerCase()
      .email({ message: "Invalid email address" })
      .min(5, { message: "Email is too short" })
      .max(254, { message: "Email is too long" }),
   password: z.string().min(6, { message: "too short minimum should be 6 letters" }).max(14, { message: "too long maximum should be 14 character " })
})

export const signInObject = z.object({
   email: z.string().trim()
   .toLowerCase()
   .email({ message: "Invalid email address" })
      .min(5, { message: "Email is too short" })
      .max(254, { message: "Email is too long" }),
   password: z.string().min(6, { message: "too short minimum should be 6 letters" }).max(14, { message: "too long maximum should be 14 character " })
})


export type SigninType=z.infer<typeof signInObject>;
export type SignupType= z.infer<typeof signUpObject>;

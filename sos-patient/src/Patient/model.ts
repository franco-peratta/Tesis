export interface Patient {
	id: number
	name: string
	dni: string
	dob: string
	phoneNumber: string | null
	emr: string
	email?: string
}
import { prisma } from "../config/db";
import { Request, Response } from "express";

export const getStats = async (_req: Request, res: Response) => {
    try {
        const now = new Date();

        // Calculate the start date of the previous quarter
        const currentMonth = now.getMonth(); // 0-based
        const quarterStartMonth = currentMonth - (currentMonth % 3);
        const quarterStart = new Date(now.getFullYear(), quarterStartMonth, 1);

        const [
            totalPatients,
            totalProviders,
            totalAppointments,
            completedAppointments,
            pendingAppointments,
            upcomingAppointments,
            newPatientsLastQuarter,
            completedAppointmentsLastQuarter
        ] = await Promise.all([
            prisma.patient.count(),
            prisma.provider.count(),
            prisma.appointment.count(),
            prisma.appointment.count({ where: { status: 'completed' } }),
            prisma.appointment.count({ where: { status: 'espera' } }),
            prisma.appointment.count({ where: { date: { gte: now.toISOString() } } }),
            prisma.patient.count({
                where: {
                    created_at: { gte: quarterStart }
                }
            }),
            prisma.appointment.count({
                where: {
                    status: 'completed',
                    date: { gte: quarterStart.toISOString() }
                }
            })
        ]);
        res.json({
            msg: "Estadisticas obtenidas exitosamente", data: {
                totalPatients,
                totalProviders,
                totalAppointments,
                completedAppointments,
                pendingAppointments,
                upcomingAppointments,
                newPatientsLastQuarter,
                completedAppointmentsLastQuarter,
            }
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al obtener STATS", error });
    }
};

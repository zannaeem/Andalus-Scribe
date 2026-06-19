"use client";

import { use, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, Calendar, Award, Activity, User, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useClinic } from "@/context/clinic-context";
import type { Patient, Appointment } from "@/types";
import { format, parseISO } from "date-fns";

type PatientDetail = Patient & { appointments: Appointment[] };

const tierColors: Record<string, string> = {
    bronze: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    silver: "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300",
    gold: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    platinum: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const statusColors: Record<string, string> = {
    booked: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    confirmed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    completed: "bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    no_show: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    rescheduled: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { clinicId } = useClinic();
    const [data, setData] = useState<PatientDetail | null>(null);
    const [missing, setMissing] = useState(false);

    useEffect(() => {
        if (!clinicId) return;
        fetch(`/api/patients/${id}?clinicId=${clinicId}`)
            .then((r) => {
                if (!r.ok) { setMissing(true); return null; }
                return r.json();
            })
            .then((d) => { if (d) setData(d); });
    }, [clinicId, id]);

    if (missing) notFound();
    if (!data) return <div className="text-sm text-muted-foreground p-4">Loading...</div>;

    const patient = data;
    const patientAppointments = data.appointments;

    return (
        <div className="space-y-6">
            {/* Back button */}
            <Link href="/patients">
                <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Patients
                </Button>
            </Link>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
                {/* Patient Info Card */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary text-lg font-bold">
                                {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </div>
                            <div>
                                <CardTitle className="text-lg">{patient.name}</CardTitle>
                                <CardDescription className="capitalize">{patient.gender || "Not specified"}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{patient.phone}</span>
                            </div>
                            {patient.email && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span>{patient.email}</span>
                                </div>
                            )}
                            {patient.date_of_birth && (
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span>{format(parseISO(patient.date_of_birth), "MMMM d, yyyy")}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>Patient since {format(parseISO(patient.created_at), "MMM yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span>PDPA Consent: {patient.consent_given ? "Given ✓" : "Pending"}</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Loyalty Card */}
                        <div className="rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-warning" />
                                    <span className="font-medium text-sm">Loyalty Points</span>
                                </div>
                                <Badge variant="secondary" className={`capitalize text-xs ${tierColors[patient.loyalty_tier]}`}>
                                    {patient.loyalty_tier}
                                </Badge>
                            </div>
                            <p className="text-3xl font-bold">{patient.loyalty_points}</p>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{patient.total_visits} total visits</span>
                                {patient.last_visit && (
                                    <span>Last: {format(parseISO(patient.last_visit), "MMM d")}</span>
                                )}
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold">{patient.total_visits}</p>
                                <p className="text-xs text-muted-foreground">Total Visits</p>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3 text-center">
                                <p className="text-xl font-bold">{patientAppointments.length}</p>
                                <p className="text-xs text-muted-foreground">Appointments</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Appointment History */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Appointment History</CardTitle>
                        <CardDescription>{patientAppointments.length} appointments on record</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {patientAppointments.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>No appointments found</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {patientAppointments.map((apt) => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                <Calendar className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {format(parseISO(apt.start_time), "EEEE, MMMM d, yyyy")}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(parseISO(apt.start_time), "h:mm a")} – {format(parseISO(apt.end_time), "h:mm a")}
                                                    {apt.doctor_name && ` · Dr. ${apt.doctor_name}`}
                                                </p>
                                                {apt.chief_complaint && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Chief complaint: {apt.chief_complaint}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs capitalize">
                                                {apt.appointment_type}
                                            </Badge>
                                            <Badge variant="secondary" className={`text-xs capitalize ${statusColors[apt.status]}`}>
                                                {apt.status.replace("_", " ")}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

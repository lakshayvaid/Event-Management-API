const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const { z } = require("zod");

// Zod schema for validation
const createEventSchema = z.object({
  title: z.string().min(1),
  date: z.string().refine((val) => new Date(val) > new Date(), {
    message: "Date must be in the future",
  }),
  location: z.string().min(1),
  capacity: z.number().min(1).max(1000),
});







// POST /events - Create new event
router.post("/", async (req, res) => {
  try {
    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten().fieldErrors });
    }

    const { title, date, location, capacity } = parsed.data;

    const event = await prisma.event.create({
      data: {
        title,
        date: new Date(date),
        location,
        capacity,
      },
    });

    res.status(201).json({ eventId: event.id });
  } catch (err) {
    res.status(500).json({ error: "Server error while creating event" });
  }
});









// rooute to get all the event details

// GET /events/:id
router.get("/:id", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        registrations: {
          include: { user: true }
        }
      }
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    res.json({
      id: event.id,
      title: event.title,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      registeredUsers: event.registrations.map((reg) => reg.user)
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch event" });
  }
});









//route for registering new user




const registerSchema = z.object({
  userId: z.number().int().positive(),
});

router.post("/:id/register", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { userId } = parsed.data;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true },
    });

    if (!event) return res.status(404).json({ error: "Event not found" });

    if (new Date(event.date) < new Date())
      return res.status(400).json({ error: "Cannot register for past events" });

    const isAlreadyRegistered = await prisma.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (isAlreadyRegistered)
      return res.status(400).json({ error: "User already registered" });

    const currentCount = await prisma.registration.count({ where: { eventId } });

    if (currentCount >= event.capacity)
      return res.status(400).json({ error: "Event is full" });

    await prisma.registration.create({
      data: { userId, eventId }
    });

    res.json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});









//route for cancelling registration

router.delete("/:id/register", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const parsed = registerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    }

    const { userId } = parsed.data;

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      }
    });

    if (!registration)
      return res.status(404).json({ error: "User not registered for this event" });

    await prisma.registration.delete({
      where: { id: registration.id }
    });

    res.json({ message: "Registration cancelled" });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel registration" });
  }
});










// route to get upcoming events 


router.get("/upcoming/events", async (req, res) => {
  try {
    const upcomingEvents = await prisma.event.findMany({
      where: {
        date: { gt: new Date() },
      },
      orderBy: [
        { date: "asc" },
        { location: "asc" },
      ],
    });

    res.json(upcomingEvents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch upcoming events" });
  }
});









// route to get event stats



router.get("/:id/stats", async (req, res) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await prisma.event.findUnique({ where: { id: eventId } });

    if (!event) return res.status(404).json({ error: "Event not found" });

    const totalRegistrations = await prisma.registration.count({
      where: { eventId }
    });

    const remaining = event.capacity - totalRegistrations;
    const percentageUsed = Math.round((totalRegistrations / event.capacity) * 100);

    res.json({
      totalRegistrations,
      remainingCapacity: remaining,
      percentageUsed: `${percentageUsed}%`,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});




// for testing creating temporary user

router.post("/test-create-user", async (req, res) => {
  const { name, email } = req.body;
  const user = await prisma.user.create({ data: { name, email } });
  res.json(user);
});



module.exports = router;

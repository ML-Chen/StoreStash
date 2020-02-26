"use strict";

import graph from "fbgraph";
import crypto from "crypto";
import mongoose from "mongoose";
import { Response, Request, NextFunction } from "express";
import { UserDocument, User } from "../models/User";
import { Listing, ListingDocument } from "../models/Listing";
import { Rental, RentalDocument } from "../models/Rental";

/**
 * Returns a random string of characters 0-9, a-f.
 * 
 * @param bytes number of bytes used for the string; each byte is two hex digits
 */
function randomString(bytes: number) {
    return crypto.randomBytes(bytes).toString("hex");
}

/**
 * GET /api
 * List of API examples.
 */
export const getApi = (req: Request, res: Response) => {
    res.render("api/index", {
        title: "API Examples"
    });
};

export const newUser = async (req: Request, res: Response) => {
    try {
        let user;
        if (req.query.random == "true" || req.body.random == "true") {
            user = await (User as unknown as UserDocument).construct(`${randomString(5)}@gatech.edu`, randomString(8));
        } else {
            user = await (User as unknown as UserDocument).construct(req.body.email, req.body.password);
        }
        res.json(user.toObject());
    } catch (err) {
        res.status(400).send(err);
    }
};

export const getRentalHistory = async (req: Request, res: Response) => {
    try {
        const history = await (Rental as unknown as RentalDocument).listRenterHistory(req.params.id);
        res.json(history.map(rental => rental.toObject()));
    } catch (err) {
        res.status(400).send(err);
    }
}

export const newListing = async (req: Request, res: Response) => {
    try {
        const listing = await (Listing as unknown as ListingDocument).construct(req.body.hostId, req.body.lat, req.body.lon, req.body.capacity, new Date(req.body.startDate), new Date(req.body.endDate), req.body.price);
        await res.json(listing.toObject());
    } catch (err) {
        console.log(err);
        res.sendStatus(400);
    }
};

export const getListing = async (req: Request, res: Response) => {
    try {
        const listing = await (await Listing.findById(req.params.id)).execPopulate();
        res.json(listing.toObject());
    } catch (err) {
        res.status(400).send(err);
    }
}

export const rentListing = async (req: Request, res: Response) => {
    try {
        const rental = await (Rental as unknown as RentalDocument).construct(mongoose.Types.ObjectId(req.params.id), req.body.renter, req.body.boxes, req.body.dropoff, req.body.pickup);
        res.json(rental.toObject());
    } catch (err) {
        res.status(400).send(err);
    }
}

export const getNearby = async (req: Request, res: Response) => {
    try {
        const listings = await (Listing as unknown as ListingDocument).getNearby(req.query.lat, req.query.lon, req.query.minCapacity, req.query.maxPrice, req.query.startDate, req.query.endDate);
        res.json(listings);
    } catch (err) {
        res.status(400).send(err);
    }
};

/**
 * GET /api/facebook
 * Facebook API example.
 */
export const getFacebook = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as UserDocument;
    const token = user.tokens.find((token: any) => token.kind === "facebook");
    graph.setAccessToken(token.accessToken);
    graph.get(`${user.facebook}?fields=id,name,email,first_name,last_name,gender,link,locale,timezone`, (err: Error, results: graph.FacebookUser) => {
        if (err) { return next(err); }
        res.render("api/facebook", {
            title: "Facebook API",
            profile: results
        });
    });
};

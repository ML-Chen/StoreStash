import React, { useState, useContext, MouseEvent } from 'react';
import { AppContext, ActionTypes } from '../context/appContext';
import { addCircle, closeCircle } from 'ionicons/icons';
import wretch from 'wretch';
import moment from 'moment';
import useSWR from 'swr';
import {
	IonContent,
	IonHeader,
	IonToolbar,
	IonButtons,
	IonMenuButton,
	IonTitle,
	IonIcon,
	IonNote,
	IonList,
	IonSelectOption,
	IonSelect,
	IonItem,
	IonLabel,
	IonDatetime,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonRow,
	IonCol,
	IonImg,
	IonButton,
	IonText,
	IonPage

} from '@ionic/react';
import { pin, cube, calendar, person, cash } from 'ionicons/icons';
import { RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';

const YourListingCard: React.FC<any> = ({ price, lat, lon, capacity, remSpace, host, fullName, startDate, endDate, _id, image }) => {
	return (<>
		<IonCard>
			<IonItem>
				<IonRow>
					<IonCol col-12>
						<IonCardTitle color="success">${price}/mo per box</IonCardTitle>
						<IonCardSubtitle><IonIcon icon={pin}></IonIcon>{`${lat.toFixed(2)}, ${lon.toFixed(2)}`} </IonCardSubtitle>
						<IonCardSubtitle><IonIcon icon={cube}></IonIcon> {capacity - remSpace}/{capacity} Boxes</IonCardSubtitle>
					</IonCol>
				</IonRow>
			</IonItem>

			<IonCardContent class="ion-no-padding">
				<IonRow>
					<IonCol col-12 >
						{image ? <IonImg src={image} alt="Room"/> : null}
						<p>Space Available: {moment(startDate).format('ll')} - {moment(endDate).format('ll')}</p>
					</IonCol>
				</IonRow>
			</IonCardContent>
		</IonCard>
	</>)
}

const HistoryCard: React.FC<HistoryType> = ({ name, price, boxes, dropoff, pickup }) => {
	const current = pickup > new Date();

	return (<>
		<IonCard color={current ? "" : "light"}>
			<IonCardContent>
				<IonCardSubtitle>{name}</IonCardSubtitle>
				<hr></hr>
				<IonRow>
					<IonCol col-12 >
						<p>
							Total Cost: <IonText color="success"><b>${price}</b></IonText> <br />
							Boxes: {boxes} <br />
							{moment(dropoff).format('ll')} - {moment(pickup).format('ll')} <br />
							Status: {current ? <IonText color="success"><b>Current</b></IonText> : "Past"}  <br />
							{current ? <a href="#"><IonText color="danger"><b>Cancel</b></IonText></a> : ""}

						</p> 
					</IonCol>
				</IonRow>
			</IonCardContent>
		</IonCard>
	</>);
}

// TODO: list spaces you've rented

const Profile: React.FC<RouteComponentProps> = (props) => {
	const { state, dispatch } = useContext(AppContext);
	const { userId, token, firstName, lastName } = state;
	let listingsContent;
	let lendingsContent;
	let rentalsContent;
	const { data: listings, error: errorListings } = useSWR(userId ? `http://localhost:3001/api/users/${userId}/listings` : null, url => wretch(url).get().json());
	const { data: lendings, error: errorLendings } = useSWR(userId ? `http://localhost:3001/api/users/${userId}/lendings` : null, url => wretch(url).get().json());
	const { data: rentals, error: errorRentals } = useSWR(userId ? `http://localhost:3001/api/users/${userId}/rentals` : null, url => wretch(url).get().json());
	if (!errorListings && listings) {
		listingsContent = listings.length > 0 ? listings.map(listing => <YourListingCard {...listing} key={listing._id} />) : <IonItem><IonLabel>No listings (yet!)</IonLabel></IonItem>
	}
	if (!errorRentals && rentals) {
		rentalsContent = rentals.length > 0 ? rentals.map(rental => <HistoryCard {...rental} key={rental._id} />) : <IonItem><IonLabel>No rentals (yet!)</IonLabel></IonItem>
	}
	if (!errorLendings && lendings) {
		lendingsContent = lendings.length > 0 ? lendings.map(lending => <HistoryCard {...lending} key={lending._id} />) : <IonItem><IonLabel>No lendings (yet!)</IonLabel></IonItem>
	}

	return (<IonPage>
		<IonHeader>
			<IonToolbar color="warning">
				<IonButtons slot="start">
					<IonMenuButton></IonMenuButton>
				</IonButtons>
				<IonTitle>Profile</IonTitle>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			<IonCard text-center>
				<IonItem>
					<IonTitle><h1>{firstName + ' ' + lastName}</h1></IonTitle>
				</IonItem>

				<IonCardContent class="ion-no-padding">
					<IonRow>
						<IonCol col-12 >
							{/* <IonImg src={user} alt="User Profile Picture"/>
							<hr></hr> */}

							<Link to={{pathname: '/post'}} style={{ textDecoration: 'none' }}>
								<IonButton expand="full" color="warning" size="default" href="/post"><IonIcon icon={addCircle} slot="start"></IonIcon>Lend Space</IonButton>
							</Link>
						</IonCol>
					</IonRow>
				</IonCardContent>
			</IonCard>

			<IonItem>
				<IonTitle>Lending History</IonTitle>
			</IonItem>
			{lendingsContent}


			<IonItem>
				<IonTitle>Renting History</IonTitle>
			</IonItem>
			{rentalsContent}

			<IonItem>
				<IonTitle>Your Listings</IonTitle>
			</IonItem>
			{listingsContent}

		</IonContent>
	</IonPage>)
}

type HistoryType = {
	name: string,
	price: number,
	boxes: number,
	dropoff: Date,
	pickup: Date,
}

export default Profile;
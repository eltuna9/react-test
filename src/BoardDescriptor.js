import React from 'react';
import List from "./List";
import {options} from './Options';

export default class BoardDescriptor extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            id : this.props.board.id,
            name : this.props.board.name,
            lists : []
        }
    }
    droppedCard;
    componentWillReceiveProps(props){
        this.getLists(props);
    }
    render(){
        return(
            <div className="main-content">
                <div className="panel panel--boardDescriptor">
                    <div className="panel__header panel__header--boardDescriptor">
                        {this.props.board.name}
                    </div>
                    <div className="panel__body">
                        <div className="row">
                            {
                                this.state.lists.map(
                                    (list) => <List
                                        {...list}
                                        handleDroppedCard={this.handleDroppedCard.bind(this)}
                                        cardDraggedHandler={this.handleCardDrag.bind(this)}
                                        key={list.id} />
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    getLists(props) {
        this.clearListsOfThisBoard();
        let url = options.baseUrl+ options.listUrl +props.board.id + "?"+ options.idNameFields + options.and + options.listFields + options.and + options.token + options.and + options.apiKey ;
        fetch(url, {
            method: 'GET',
        }).then((response) => {
            return response.json();
        }).then(data => {
            this.getCards(data.lists);
        }).catch(function(err) {
            alert("Something went wrong! " +err.message);
        });
    }
    clearListsOfThisBoard(){
        let myState = Object.assign({}, this.state);
        myState.lists = [];
        this.setState(myState);
    }
    getCards(lists) {
        lists.map( list => {this.getOneListCards(list)});
    }
    getOneListCards(list){
        let url = options.baseUrl+ options.cardsUrl + list.id + options.cardFields + options.and + options.token + options.and + options.apiKey ;
        fetch(url, {
            method: 'GET',
        }).then((response) => {
            return response.json();
        }).then(data => {
            list.cards = data;
            let myState = Object.assign({}, this.state);
            myState.lists.push(list)
            this.setState(myState);
        }).catch(function(err) {
            alert("Something went wrong! " +err.message);
        });
    }
    handleDroppedCard (receiverListId){
        if(this.droppedCard.idList != receiverListId){
            this.moveCard(receiverListId);
        }
    }
    handleCardDrag(card){
        this.droppedCard = card;
    }
    moveCard(receiverListId){
        let putUrl = "https://api.trello.com/1/cards/" + this.droppedCard.id+ "?idList=" + receiverListId + options.and + options.apiKey + options.and + options.token;
        fetch(putUrl, {
            method: 'PUT',
        }).then(() => {
            this.showCardMove(receiverListId);
        }).catch(function(err) {
            alert("Something went wrong! " +err.message);
        });

    }
    showCardMove(receiverListId){
        let myState = Object.assign({}, this.state);
        let lasParentCardId = this.droppedCard.idList;
        this.droppedCard.idList = receiverListId;
        //adding droppedCard to the receiverlist.
        let listIndex = myState.lists.findIndex(item => item.id === receiverListId);
        myState.lists[listIndex].cards.push(this.droppedCard);
        //removing draggedCard from the initial list
        listIndex = myState.lists.findIndex(item => item.id === lasParentCardId);
        let cardIndex = myState.lists[listIndex].cards.findIndex(item => item.id === this.droppedCard.id);
        myState.lists[listIndex].cards.splice(cardIndex,1);
        this.setState(myState);
    }

}
import DetailsCard from "../../shared/details_card_with_search_field"

export default function EntranceDetails({ entrances }){
    return (
        <DetailsCard 
            title="Entrances"
            subheader="Enter entrance to view, edit or delete schedule"
            entities={ entrances }
            getLabel={ (entrance) => entrance.entranceName }
            getLink={ (entrance) => `dashboard/entrance/details/${entrance.entranceId}` }
            emptyLabel="No entrances"
        />
    )
}

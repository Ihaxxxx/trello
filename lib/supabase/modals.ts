
export interface Board{
    id : string,
    title : string,
    description : string | null,
    color : string,
    user_id : string,
    created_at : string,
    updated_at : string
}

export interface Column {
    id : string,
    board_id : string,
    title : string,
    sort_order : number,
    created_at : string,
    user_id : string,
}

export interface Task {
    id : string,
    created_at : string,
    title : string,
    description : string | null,
    assignee : string | null ,
    due_date : string | null,
    priority : 'low' | "medium" | "high" ,
    sort_order : number,
    column_id : string,
    updated_at : string,
}

export type ColumnWithTask = Column & {
    tasks : Task[]
}



export interface User {
    id : string,
    email : string,
    first_name : string | null,
    last_name : string | null,
    image_url : string,
    created_at : Date | null,
}


export interface Team {
    id : string,
    team_name : string,
    admin_id : string,
    created_at : Date,
    description : string,
    admin_name : string,
    image_url : string | null,
}



export interface TeamWithUsers {
  team_details: Team;
  users: User[];
}

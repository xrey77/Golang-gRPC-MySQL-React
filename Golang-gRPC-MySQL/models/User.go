package models

import (
	"strconv"
	"time"

	proto "golang_grpc_mysql/proto"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID          int       `gorm:"type:integer;primarykey"`
	Lastname    string    `gorm:"size:255;default:null"`
	Firstname   string    `gorm:"size:255;default:null"`
	Email       string    `gorm:"size:255;uniqueIndex;not:null"`
	Mobile      string    `gorm:"size:255;default:null"`
	Username    string    `gorm:"size:255;uniqueIndex;not:null;type:varchar(255) COLLATE utf8mb4_bin"`
	Password    string    `gorm:"size:255"`
	Isactivated bool      `gorm:"type:tinyint(1);default:1"`
	Isblocked   bool      `gorm:"type:tinyint(1);default:0"`
	Userpicture string    `gorm:"default:pix.png"`
	Mailtoken   int32     `gorm:"type:integer;default:0"`
	Secret      string    `gorm:"type:text;default:null"`
	Qrcodeurl   string    `gorm:"type:text;default:null"`
	CreatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP(3)"`
	UpdatedAt   time.Time `gorm:"default:CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)"`
	Role_id     int       `gorm:"type:integer"`

	Roles []Role `gorm:"many2many:user_roles;"`
}

// func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
// 	if u.ID == "" {
// 		u.ID = uuid.New().String()
// 	}
// 	return
// }

// ToProto converts GORM DB model to Protobuf model
func (u *User) ToProto() *proto.UserProfile {
	return &proto.UserProfile{
		Id:        strconv.Itoa(u.ID),
		FirstName: u.Firstname,
		LastName:  u.Lastname,
		Email:     u.Email,
		Mobile:    u.Mobile,
		Username:  u.Username,
		UserPic:   u.Userpicture,
		IsActive:  u.Isactivated,
		IsBlocked: u.Isblocked,
		MailToken: strconv.FormatInt(int64(u.Mailtoken), 10),
	}
}

//输入n个朋友的信息，包括姓名、生日、电话号码，
//本题要求编写程序，按照年龄从大到小的顺序依次输出通讯录
#include"stdio.h"
struct friends
{
	char name[10];
	int birth;
	char number[11];
};
int main()
{
	int n;
	scanf("%d",&n);
	struct friends fri[n],t;
	for(int i=0;i<n;i++){
		scanf("%s %d %s",fri[i].name,&fri[i].birth,fri[i].number);
	}
	for(int i=0;i<n-1;i++){
		if(fri[i+1].birth<fri[i].birth){
			t=fri[i];
			fri[i]=fri[i+1];
			fri[i+1]=t;
		}
	}
	for(int i=0;i<n;i++){
		printf("%s %d %s",fri[i].name,fri[i].birth,fri[i].number);
		printf("\n");
	}
	
	
	return 0;
} 

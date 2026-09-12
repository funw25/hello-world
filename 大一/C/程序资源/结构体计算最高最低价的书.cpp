//编写程序，从键盘输入一个本书的名称和定价并存入结构体数组中，
//从中查找定价最高和最低的书，输出该书的名称和定价。
#include"stdio.h"
struct book
{
	char name[30];
	float price;
};
int main()
{
	int n;
	scanf("%d",&n);
	struct book books[n];
	for(int i=0;i<n;i++){
		scanf("%s%f",books[i].name,&books[i].price);
	}
	int maxindex=0;
	int minindex=0;
	for(int i=1;i<n;i++){
		if(books[i].price<books[minindex].price){
			minindex=i;
		}
		if(books[i].price>books[maxindex].price){
			maxindex=i;
		}
	}
	printf("价格最高的书的名称和价格是%s,%f\n",books[maxindex].name,books[maxindex].price);
	printf("价格最低的书的名称和价格是%s,%f\n",books[minindex].name,books[minindex].price);
	return 0;
}

//编写一个递归函数求A的b次方，从键盘输入A和b，考虑b>=0和b<0两种情况
#include"stdio.h" 
int mypow(int a,int b)
{
	int result;
	if(b>0){
		result=a*mypow(a,b-1) ;
	}
	else if(b==0){
		result=1;
	}
	else{
		result=1/(a*mypow(a,-b-1));	//负数次幂，先计算其绝对值对应的正数次幂，再取倒数
	}
	return result;
}

int main()
{
	int a,b;
	scanf("%d %d",&a,&b);
	printf("%d",mypow(a,b));
	return 0;
}

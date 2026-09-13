
//学习函数
一个函数仅实现一个功能
 

#include<stdio.h>
void f(void)
{
	int i;
	for(i=1;i<5;i++)
	   {
	   	printf("i want to wake up!\n");
	   	break ;//break只会终止它所在的这个for 循环 
	   }
	printf("I believe i am living a better life.");
}
int main(void)
{
	f();
	return 0;
 } 
 
 

#include<stdio.h> 
void f(void)
{
	int i;
	for(i=1;i<5;i++)
	   {
	   	printf("i want to wake up!\n");
	   	return ;//return 会终止它所在的这个函数 
	   }
	printf("I believe i am living a better life.");
}
int main(void)
{
	f();
	return 0;
 } 

/*
------
输出： 
return——
 
i want to wake up!


return 0——（×）
 
*/



#include<stdio.h> 
int  f(void)
{
	int i;
	for(i=1;i<5;i++)
	   {
	   	printf("i want to wake up!\n");
	   	return 3;//return 会终止它所在的这个函数 
	   }
	printf("I believe i am living a better life.");
}
int main(void)
{
	f();//return 只是告诉这个程序f的结果是3，但没有printf，所以不会显示。“没有告知的义务？ ” 
	return 0;
 } 



//函数举例子 求最大值 
//实现功能需要maiin和函数的协调配合 
/*
1.
#include<stdio.h>
void max(int i,int j)
{
	if(i>j)
	  printf("%d\n",i);
	else
	  printf("%d\n",j);
}
int main(void)
{
	int a,b,c,d;
	a=2;
	b=3;
	c=4;
	max(a,b);
	max(b,c);
	max(a,c);
	
	return 0;
 } 


*/
/*
2.
#include<stdio.h>
int max(int i,int j)
{
	if(i>j)
	  return i; 
	else
	  return j;
}
int main(void)
{
	int a,b,c,d;
	a=2;
	b=3;
	c=4;
	max(a,b);
	printf("%d\n",max(a,b));
	max(b,c);
	max(a,c);
	
	return 0;
 } 
*/

//一，改变函数返回值，从void变为int
//二，return X 代表了返回 X，
//三，返回了不代表要打印出来，需要有一个printf才能打印。
//注意printf里输出参数写的是什么，不是i和j，而是a，和b
 //想要输出：1.函数里直接输出
 //          2.把值返回过来，在main里输出 


//函数举例子  判断数字 是不是素数
//我自己的代码（gpt修改版） 
/*
#include<stdio.h>
int  sushu(int i)//发现要返回sum，所以把void改为了int 
{
	int j;
	int sum=0;
	if(i==1||i==2)
	  sum=0;
	else 
	{
		for(j=2;j<i;j++)
		{
			if(i%j==0)
			  sum=sum+1;
			
		}
	}
	return sum;
}
int main(void)
{
	int sum;//需要重新定义sum。然后上面sushu（）的值要赋值给sum才行 
	int i;
	printf("请输入一个数字！\n");
	scanf("%d",&i);
	sum=sushu(i);
	if(sum==0)
	printf("Yes!\n");
	else
	printf("No!\n");
	
	
	return 0;
 } 
*/
//老师的代码

一，什么是素数？只能被1和它本身整除 
二,从1到该数字，只要用这个数字除以中间的数字就行了，（除去它自己和1） ，如果有一个，就不是素数 

#include<stdio.h>
int main(void)
{
	int val;
	int i;
	
	scanf("%d",&val);
	for(i=2;i<val;++i)
	{
		if(val%i==0)
		break;//break如果能执行（终止for循环，则i一定是小于val的 
		//如果i的值一直加到了val，说明这个语句没有成立过   
	}
	
	if (i==val) 
	    printf("Yes!\n");
	else
	    printf("No!\n");
	
	return 0;
	
}
*/
//这个程序只能求一个数据是不是素数。
//下面使用函数 
 
/*
#include<stdio.h>

 IsPrime()  //先写出了函数名字IsPrime ，然后想是否有返回值，返回值类型是什么 
{
 	
 }
 
 
int main(void)
{
	
	
	return 0;
}



*/
/*
#include<stdio.h>

bool IsPrime()  //c中有一个数据类型是bool类型（布尔类型）， 这个bool类型只有两个值，一个真值一个假值 
{//当然这里也可以用整型，1为真0为假 ，bool更好一些 
 	
 }
 
 
int main(void)
{
	
	
	return 0;
}

*/

//是否需要定义形参？
//是为了一个具体的程序设计的？ 
//还是大量的 类似问题设计？
//是否需要接受数据？不接收数据怎么知道对谁判断？
// 功能：判断一个数字是不是素数，所以要定义一个形参，来接收待判断的数字
//一个够吗？ 
//  如果求两个数字的最大值，写两 个形参。如果求四个数字的最大值，写四个形参。
//几个形参看具体功能。 
/*
#include<stdio.h>

bool IsPrime(int val)  
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}

}

int main(void)
{
	
	
	return 0;
}

//打印功能，函数功能，程序内不同块的功能划分 

// Isprime这个函数的功能是对这个数字是不是素数进行判断真假，不要它对真假这个结果进行处理。
//所以不能写printf 

#include<stdio.h>

bool IsPrime(int val)  
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}
	if (i==val)
	   printf("Yes!\n");//不能这么写，看下面 
	else
	   printf("No!\n");//no！ 
	   

}

int main(void)
{
	
	
	return 0;
}

*/
//不要把整个功能粘合在一起。写函数，尽量功能单一 
//是不是素数的结果如何处理交给程序的另一个部分 
/*
#include<stdio.h>

bool IsPrime(int val)  //上下两个val是没有冲突的，因为这个val是只在上面使用后，下面那个只能在main使用 
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}
	if (i==val)
	   return  true;
	else
	   return false;
	   

}

int main(void)
{
	int val;
	int i;
	
	scanf("%d",&val);
	
	if(IsPrime(val))
	 printf("Yes!");
	else
	   printf("No!");
	
	return 0;
}

*/
/*
#include<stdio.h>

bool IsPrime(int val)  //上下两个val是没有冲突的，因为这个val是只在上面使用后，下面那个只能在main使用 
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		  break;
	}
	if (i==val)
	   return  true;
	else
	   return false;
	   
	//…… 如果这里还有其他语句，是不会执行的。因为上面return执行之后，这 

}

int main(void)
{
	int m;
	int i;
	
	scanf("%d",&m);
	
	if( IsPrime(m) )//调用IsPrime函数，m的值发送给val 
	//  上面这  IsPrime(m) 的值最终是true或者false 
	   printf("Yes!");
	else
	   printf("No!");

	return 0;
}


*/


//易错大总结！！！！！！！！！！！！！
/* 
#include<stdio.h>

void f(void)
{
	
	
}
int main(void)
{
	
	f(5);//这样是错的，因为f（void），括号里是void所以无形参 ，没法发送过去 
	return 0;
}



#include<stdio.h>

void f(int i)
{
	
	
}
int main(void)
{
	
	f(5);//这样是对的 
	return 0;
}





#include<stdio.h>

void f(int i,int j)
{
	
	
}
int main(void)
{
	
	f(5);//这样错了 
	return 0;
}





#include<stdio.h>

void f(int i)
{
	
	
}
int main(void)
{
	int i;
	
    i=f(5);//这样错了 ,因为   f（）前面的void表示函数没有返回值 ，现在要把f（5） 执行的结果赋给i，但没有返回值 
	return 0;
}




#include<stdio.h>

int f(int i)
{
	
	
}
int main(void)
{
	int i;
	
    i=f(5);//这样错了 , f（）前面的int 是有返回值的一种表现，这个是对的，但是内部没写return ，没有返回值 
	return 0;
}




#include<stdio.h>

int f(int i)
{
	
	return 10;//return 的含义：1.终止f函数  2.向调用f函数的地方返回return 后面写的值，此处为10 
}
int main(void)
{
	int i;
	
    i=f(5);
	return 0;
}


#include<stdio.h>

int f(int i)
{
	
	return 10;//
}
int main(void)
{
	int i=99;
	printf("%d\n",i);
    i=f(5);
    printf("%d\n",i);
    
	return 0;
}
--
输出：
99
10
 

#include<stdio.h>

int f(int i)
{
	
	return 10.8;
}
int main(void)
{
	int i=99;
	printf("%d\n",i);
    i=f(5);
    printf("%d\n",i);
    
	return 0;
}

输出：99
10
 


#include<stdio.h>

int f(int i)
{
	
	return 10.8;
}
int main(void)
{
	float i=99;
	printf("%f\n",i);
    i=f(5);
    printf("%f\n",i);
    
	return 0;
}
*/



//函数的声明
/*
1.没形参一定要写void
 
#include<stdio.h>

void f()//这个函数是不规范的，没有形参要写void，即使写不写效果一样， 
{
	
	printf("HH!");
}
int main(void)
{

	return 0;
}

改正：

  
#include<stdio.h>

void f(void)//这个函数是不规范的，没有形参要写void，即使写不写效果一样， 
{
	
	printf("HH!");
}
int main(void)
{
    f();
	return 0;
}
*/
//2.函数的声明 

#include<stdio.h>
int main(void)
{
	f();
    
	return 0;
}

void f(void)
{
	printf("haha!");
}


//放下面，报错

//因为先从main进去，不知道f（）是个函数名。
//放上面，（因为是从上往下编译的），就知道是个函数名了

 //如果想把函数放在main函数下面且不出错，就加一个函数的声明 
 //函数的声明分号一定不能丢！！！！ 

//函数的声明 告诉程序，将来会有一个叫f的东西，它没有形参，没有返回值 

#include<stdio.h>
void f(void);//分号别丢了！！ 
int main(void)
{
	f();
    
	return 0;
}

void f(void)
{
	printf("haha!");
}


//如果： 


#include<stdio.h>
void f(int);//分号别丢了！！ 
int main(void)
{
	f();//会报错  ，因为前面已经生命力f内部的形参是整型的，所以进行到这里就报错了 
    
	return 0;
}

void f(void)
{
	printf("haha!");
}


//函数嵌套＋调用
#include<stdio.h>
void g(void)
{
	
	f();//此处调用了f，但f没有定义，所以会报错 
	//函数f的定义放到了调用f的语句的后面，所以语法出错 
}
void f(void)
{
	printf("ha!\n");
}
int main(void) 
{
	g();
	
}


//形参和实参
1.
#include<stdio.h>
void f(int i)//这里是形参 
{
	printf("%d\n",i);
	
}
int main(void)
{
	f(5)//5是实参 
	return 0;
 } 
 
 
 
2.

#include<stdio.h>
void f(int i,int j)//这样会报错 
{
	printf("%d\n",i);
	
}
int main(void)
{
	f(5)//数量不匹配，报错 
	return 0;
 } 
//必须一一对应 

3.
//类型要对应 
#include<stdio.h>
void f(int i,float x)
{
	printf("%d\n",i);
}

int main(void)
{
	f(5,6.6);
	
	return 0;
}

//或者说类型能够兼容
//下面这个可以兼容 
 #include<stdio.h>
void f(int i,float x)
{
	printf("%d\n",i);
}

int main(void)
{
	f(5。8,6.6);
	
	return 0;
}

//下面这个就不能兼容
 
#include<stdio.h>
void f(int i,float x)
{
	printf("%d\n",i);
}

int main(void)
{
	f("caleb",6.6);
	
	return 0;
}








*/








//如何在开发中合理地设计函数来解决实际问题 

/*
判断一个数字是否是素数 
只用一个函数实现，不好，代码的利用率不高 
*/
#include<stdio.h>
int main(void)
{
	int i;
	int val;
	
	scanf("%d",&val);
	
	for(i=2;i<val;++i)
	{
		if(val%i==0)
		  break;
		
	}
	if(i==val)
	  printf("Yes!\n");
	else
	  printf("No!\n");
	  
	  
	  
	return 0;
}



//函数设计功能要单一（判断；处理……） 

//接下来设计函数
//判断一个数字是否是素数，用单独的代码来实现，可利用性提高 
#include<stdio.h>
bool IsPrime(int val)
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		break;
		
	}
	
	if(i==val)
	return true;
	else
	return false;
	
}
int main(void)
{
	int val;
	scanf("%d\n",&val);
	IsPrime(val);
	
	if ( IsPrime(val) )
	   printf("Yes!\n");
	else 
	   printf("No~");
	
	return 0;
 } 


*/

/*
//求1到某个数字之间所有的素数，并且输出 


#include<stdio.h>
bool IsPrime(int val)
{
	int i;
	
	for(i=2;i<val;i++)
	{
		if(val%i==0)
		break;
		
	}

	
	if(i==val)
	return true;
	else
	return false;
	
}

int main(void)
{
	int num;
	int val;
	int i;
	
	scanf("%d",&num);
	for(i=1;i<=num;i++)
	{
		val=i;
		IsPrime(val);
		
		if(IsPrime(val) )
		  printf("%d is Prime!\n",i);
		else
		  printf("%d is not Prime!\n",i);
	}
	
	
	return 0;
}

//以上为我写的代码。为什么无法判断1呢？ 

//逻辑出错了
首先，1不是素数（质数）
素数/质数指：大于1的自然数，除了1和它本身外，没有其他正因数（无法被其他自然数整除）
 
 
//老师的代码 
#include<stdio.h>
int main(void)
{
	int val;
	int i;
	int j;
	
	scanf("%d",&val);
	for(i=2;i<val;i++)
	{
		for(j=2;j<i;j++)
		{
			//这个for循环内部要判断是不是素数，是就输出，不是就不输出 
			if(i%j==0)//定义另一个变量j，i除以j的值（从2到i-1）能整除就不是素数
			{
				printf("Yes!");
				break;
			}
			if(i==j)
			printf("%d",i);
		
		}
	 } 
	
	return 0;
 } 

/*
1.代码的重用性不高， 
2.代码不容易理解


 

 //使用函数 
#include<stdio.h>
bool IsPrime(int i)
{
	int j;
	for(j=2;j<i;j++)
	{
		if(i%j==0)
		break;
	}
	if(i==j)
	return true;
	else
	return false;
	
}

int main(void)
{
	int val;
	int i;

	scanf("%d",&val);
	for(i=2;i<=val;i++)
	{
		if(IsPrime(i))
		  printf("%d\n",i);
		
	}
	return 0;
}
//代码更容易理解了，可重用性高了一些 
//这个程序的缺陷：
// 可重用性依然不是很高，蔽日求100000个数字，从一到它们本身的所有素数，要输入100000次 

*/





/*

//再次进行修正
//用两个函数实现求1到某个数字之间所有的素数，并将其输出，代码量更少，可重复性更高 
#include<stdio.h>

//本函数的功能是：判断 m是否是素数，是：返回true；不是：返回false 
bool IsPrime(int m)
{
	int j;
	for(j=2;j<m;j++)
	{
		if(m%j==0)
		break;
	}
	if(i==m)
	  return true;
	else
	  return false;
	
}

//这个函数的功能是把1到n之间所有素数在显示器上输出 
void TraverseVal(int n)
{
	int i;
	
	for(i=2;i<=n;++i)
	{
		if(IsPrime(i))
		  printf("%d\n",i);
		
	}
	
}

int main(void)
{
	int val;
	int i;

	scanf("%d",&val);
    TraverseVal(val);

	return 0;
}
  
*/






















